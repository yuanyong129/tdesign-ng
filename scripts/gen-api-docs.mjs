#!/usr/bin/env node
/**
 * 从组件源码的 TSDoc 注释生成 API 文档数据。
 *
 * 约定（与 tdesign-vue-next 的注释风格一致）：
 *
 *   /**
 *    * @zh 按钮的类型
 *    * @en Button type
 *    * @defaultValue 'secondary'
 *    * @values 'primary' | 'secondary' | 'dashed'
 *    *\/
 *   @Input() type?: ButtonTypes;
 *
 * 支持两种声明方式，P1 之后的新组件用信号式，存量的装饰器式也能解析：
 *   @Input() foo = 1;            / @Output() bar = new EventEmitter<T>();
 *   readonly foo = input(1);     / readonly bar = output<T>();
 *
 * 用法：
 *   node scripts/gen-api-docs.mjs            # 生成 JSON
 *   node scripts/gen-api-docs.mjs --check    # 只校验（缺失描述/类型时报错，供 CI 用）
 *   node scripts/gen-api-docs.mjs --verbose  # 打印每个组件的解析结果
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT, 'packages/ng-components/src/components');
const OUT_FILE = path.join(ROOT, 'packages/docs/src/app/api/api.generated.json');

const argv = process.argv.slice(2);
const CHECK_ONLY = argv.includes('--check');
const VERBOSE = argv.includes('--verbose');

/** 递归列出目录下的 .ts 文件，跳过测试与样式目录。 */
async function listTsFiles(dir) {
  const out = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'styles' || entry.name === 'style' || entry.name === 'node_modules') continue;
      out.push(...(await listTsFiles(full)));
    } else if (entry.isDirectory() === false && entry.name.endsWith('.ts')) {
      if (/\.spec\.ts$/.test(entry.name)) continue;
      out.push(full);
    }
  }
  return out;
}

/**
 * 收集 `export const FOO_TYPES = ['a', 'b'] as const;` 这类元组，
 * 用于把 `ButtonTypes` 这样的类型别名还原成可选值列表。
 */
function collectValueTuples(files) {
  const tuples = new Map();
  for (const file of files) {
    const text = ts.sys.readFile(file);
    if (!text) continue;
    const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
    const visit = (node) => {
      if (
        ts.isVariableDeclaration(node) &&
        ts.isIdentifier(node.name) &&
        node.initializer &&
        (ts.isArrayLiteralExpression(node.initializer) ||
          (ts.isAsExpression(node.initializer) && ts.isArrayLiteralExpression(node.initializer.expression)))
      ) {
        const arr = ts.isAsExpression(node.initializer) ? node.initializer.expression : node.initializer;
        const values = [];
        for (const el of arr.elements) {
          if (ts.isStringLiteral(el) || ts.isNoSubstitutionTemplateLiteral(el)) values.push(el.text);
          else if (ts.isNumericLiteral(el)) values.push(el.text);
        }
        if (values.length) tuples.set(node.name.text, values);
      }
      ts.forEachChild(node, visit);
    };
    visit(source);
  }
  return tuples;
}

/** 读取一个节点上的 JSDoc 信息：描述 + 自定义标签。 */
function readJsDoc(node, valueTuples) {
  const docs = ts.getJSDocCommentsAndTags(node).filter(ts.isJSDoc);
  const doc = docs[docs.length - 1];
  const result = { zh: '', en: '', defaultValue: undefined, values: [], tags: {}, deprecated: false, internal: false };
  if (!doc) return result;

  const summary = ts.getTextOfJSDocComment(doc.comment)?.trim() ?? '';
  result.zh = summary;
  result.en = summary;

  for (const tag of doc.tags ?? []) {
    const name = tag.tagName.text;
    const text = ts.getTextOfJSDocComment(tag.comment)?.trim() ?? '';
    if (name === 'zh') result.zh = text;
    else if (name === 'en') result.en = text;
    else if (name === 'defaultValue') result.defaultValue = text;
    else if (name === 'values') {
      result.values = splitValues(text);
    } else if (name === 'deprecated') {
      result.deprecated = true;
      if (text) result.tags.deprecated = text;
    } else if (name === 'internal') {
      result.internal = true;
    } else {
      result.tags[name] = text;
    }
  }
  return result;
}

/** `'a' | 'b'` / `'a','b'` / `a | b` 统一拆成数组。 */
function splitValues(text) {
  return text
    .split(/[|,，]/)
    .map((v) => v.trim().replace(/^['"`]|['"`]$/g, ''))
    .filter(Boolean);
}

/** 规范化为小写字母数字，用于跨命名风格比较（BORDER_SHAPES ≈ BorderShape）。 */
function normalizeName(name) {
  return name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
}

/**
 * 查找某个常量元组能否作为类型别名的取值来源。
 * 命名不统一（BUTTON_TYPES / BORDER_SHAPES / SIZES），所以用前缀匹配 + 最短优先。
 */
function lookupTuple(name, valueTuples) {
  const target = normalizeName(name);
  let best = null;
  for (const [constName, values] of valueTuples) {
    const candidate = normalizeName(constName);
    if (candidate === target || candidate.startsWith(target)) {
      if (!best || candidate.length < best.len) best = { len: candidate.length, values };
    }
  }
  return best?.values ?? null;
}

/** 从初始化表达式推断类型（没有类型标注时用）。 */
function inferTypeFromInit(init, source) {
  if (!init) return 'any';
  if (ts.isStringLiteral(init) || ts.isNoSubstitutionTemplateLiteral(init) || ts.isTemplateExpression(init))
    return 'string';
  if (ts.isNumericLiteral(init)) return 'number';
  if (init.kind === ts.SyntaxKind.TrueKeyword || init.kind === ts.SyntaxKind.FalseKeyword) return 'boolean';
  if (ts.isArrayLiteralExpression(init)) return 'any[]';
  if (ts.isNewExpression(init) && ts.isIdentifier(init.expression)) return init.expression.text;
  return 'any';
}

/** 从类型节点取出类型文本；遇到 `XxxTypes` 这类别名时尝试还原可选值。 */
function typeInfo(typeNode, source, valueTuples) {
  if (!typeNode) return { type: 'any', values: [] };
  const type = typeNode.getText(source);
  const values = [];
  if (ts.isTypeReferenceNode(typeNode) && ts.isIdentifier(typeNode.typeName)) {
    const tuple = lookupTuple(typeNode.typeName.text, valueTuples);
    if (tuple) values.push(...tuple);
  }
  if (ts.isUnionTypeNode(typeNode)) {
    for (const t of typeNode.types) {
      if (ts.isLiteralTypeNode(t)) {
        const lit = t.literal;
        if (ts.isStringLiteral(lit) || ts.isNumericLiteral(lit)) values.push(lit.text);
      }
    }
  }
  return { type, values };
}

/** 判断属性是否是 `input()` / `input.required()` / `output()` 调用。 */
function signalKind(node) {
  if (!ts.isPropertyDeclaration(node) || !node.initializer) return null;
  let init = node.initializer;
  if (ts.isAsExpression(init) || ts.isSatisfiesExpression(init)) init = init.expression;
  if (!ts.isCallExpression(init)) return null;
  const callee = init.expression;
  if (ts.isIdentifier(callee)) {
    if (callee.text === 'input') return { kind: 'input', call: init, required: false };
    if (callee.text === 'output') return { kind: 'output', call: init, required: false };
  }
  if (ts.isPropertyAccessExpression(callee) && ts.isIdentifier(callee.expression)) {
    if (callee.expression.text === 'input' && callee.name.text === 'required')
      return { kind: 'input', call: init, required: true };
  }
  return null;
}

/** 判断属性是否带某个装饰器，返回装饰器节点。 */
function findDecorator(node, name) {
  for (const dec of ts.getDecorators(node) ?? []) {
    const expr = ts.isCallExpression(dec.expression) ? dec.expression.expression : dec.expression;
    if (ts.isIdentifier(expr) && expr.text === name) return dec;
  }
  return null;
}

/** 取 `@Input()` 的别名（`@Input('foo')` 或 `@Input({ alias: 'foo' })`）。 */
function inputAlias(dec) {
  if (!ts.isCallExpression(dec.expression) || !dec.expression.arguments.length) return null;
  const arg = dec.expression.arguments[0];
  if (ts.isStringLiteral(arg)) return arg.text;
  if (ts.isObjectLiteralExpression(arg)) {
    for (const prop of arg.properties) {
      if (
        ts.isPropertyAssignment(prop) &&
        ts.isIdentifier(prop.name) &&
        prop.name.text === 'alias' &&
        ts.isStringLiteral(prop.initializer)
      )
        return prop.initializer.text;
    }
  }
  return null;
}

/** 取 `@Component({ selector: 't-button' })` 里的选择器。 */
function componentSelector(dec) {
  if (!ts.isCallExpression(dec.expression) || !dec.expression.arguments.length) return '';
  const arg = dec.expression.arguments[0];
  if (!ts.isObjectLiteralExpression(arg)) return '';
  for (const prop of arg.properties) {
    if (ts.isPropertyAssignment(prop) && ts.isIdentifier(prop.name) && prop.name.text === 'selector') {
      if (ts.isStringLiteral(prop.initializer)) return prop.initializer.text;
    }
  }
  return '';
}

/** 解析一个 .ts 文件里所有 @Component 类。 */
function parseFile(file, source, valueTuples) {
  const components = [];
  const visit = (node) => {
    if (ts.isClassDeclaration(node) && node.name) {
      const compDec = findDecorator(node, 'Component');
      if (compDec) {
        const api = {
          className: node.name.text,
          selector: componentSelector(compDec),
          file: path.relative(ROOT, file).split(path.sep).join('/'),
          inputs: [],
          outputs: [],
        };

        for (const member of node.members) {
          if (!ts.isPropertyDeclaration(member) || !ts.isIdentifier(member.name)) continue;

          // 1) 信号式：input() / input.required() / output()
          const sig = signalKind(member);
          if (sig) {
            const doc = readJsDoc(member, valueTuples);
            const typeArg = sig.call.typeArguments?.[0];
            const info = typeArg
              ? typeInfo(typeArg, source, valueTuples)
              : { type: inferTypeFromInit(sig.call.arguments[0], source), values: [] };
            if (sig.kind === 'input') {
              const fallback = sig.call.arguments[0]?.getText(source);
              api.inputs.push({
                name: member.name.text,
                type: info.type,
                default: doc.defaultValue ?? fallback ?? (sig.required ? undefined : 'undefined'),
                required: sig.required,
                zh: doc.zh,
                en: doc.en,
                values: doc.values.length ? doc.values : info.values,
                deprecated: doc.deprecated || undefined,
                internal: doc.internal || undefined,
              });
            } else {
              api.outputs.push({ name: member.name.text, type: info.type, zh: doc.zh, en: doc.en });
            }
            continue;
          }

          // 2) 装饰器式：@Input() / @Output()
          const inDec = findDecorator(member, 'Input');
          const outDec = findDecorator(member, 'Output');
          if (!inDec && !outDec) continue;

          const doc = readJsDoc(member, valueTuples);
          const info = member.type
            ? typeInfo(member.type, source, valueTuples)
            : { type: inferTypeFromInit(member.initializer, source), values: [] };
          if (inDec) {
            const init = member.initializer?.getText(source);
            api.inputs.push({
              name: inputAlias(inDec) ?? member.name.text,
              type: info.type,
              default: doc.defaultValue ?? init ?? 'undefined',
              required: !member.questionToken && !init,
              zh: doc.zh,
              en: doc.en,
              values: doc.values.length ? doc.values : info.values,
              deprecated: doc.deprecated || undefined,
                internal: doc.internal || undefined,
            });
          } else {
            api.outputs.push({ name: member.name.text, type: info.type, zh: doc.zh, en: doc.en });
          }
        }

        components.push(api);
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  return components;
}

/** 校验：每个输入都必须有中英文描述，否则视为文档缺失。 */
function validate(components) {
  const problems = [];
  for (const c of components) {
    for (const input of c.inputs) {
      if (!input.zh) problems.push(`${c.className}.${input.name}: 缺少 @zh 描述`);
      if (!input.en) problems.push(`${c.className}.${input.name}: 缺少 @en 描述`);
    }
  }
  return problems;
}

async function main() {
  const files = await listTsFiles(SRC_DIR);
  // 可选值常量（SIZES / BORDER_SHAPES 等）定义在 src/_utils 下，收集范围要比解析范围大。
  const valueTuples = collectValueTuples(await listTsFiles(path.join(ROOT, 'packages/ng-components/src')));

  const components = [];
  for (const file of files) {
    const text = await fs.readFile(file, 'utf8');
    const source = ts.createSourceFile(file, text, ts.ScriptTarget.Latest, true);
    components.push(...parseFile(file, source, valueTuples));
  }
  components.sort((a, b) => a.className.localeCompare(b.className));

  if (VERBOSE) {
    for (const c of components) {
      console.log(`\n<${c.selector}> ${c.className}  (${c.inputs.length} inputs, ${c.outputs.length} outputs)`);
      for (const i of c.inputs) console.log(`  ${i.name}${i.required ? '' : '?'}: ${i.type} = ${i.default}`);
    }
  }

  const problems = validate(components);
  const payload = {
    generatedBy: 'scripts/gen-api-docs.mjs',
    components: Object.fromEntries(components.map((c) => [c.className, c])),
  };

  const totalInputs = components.reduce((n, c) => n + c.inputs.length, 0);
  console.log(
    `解析到 ${components.length} 个组件、${totalInputs} 个输入属性，来自 ${files.length} 个源文件。`,
  );

  if (problems.length) {
    console.log(`\n文档缺失 ${problems.length} 处：`);
    for (const p of problems.slice(0, 40)) console.log(`  - ${p}`);
    if (problems.length > 40) console.log(`  ... 另有 ${problems.length - 40} 处`);
  }

  if (CHECK_ONLY) {
    if (problems.length) {
      console.error('\n--check 失败：请补齐上述 TSDoc 注释。');
      process.exit(1);
    }
    console.log('--check 通过。');
    return;
  }

  await fs.mkdir(path.dirname(OUT_FILE), { recursive: true });
  await fs.writeFile(OUT_FILE, JSON.stringify(payload, null, 2) + '\n', 'utf8');
  console.log(`已写入 ${path.relative(ROOT, OUT_FILE).split(path.sep).join('/')}`);
}

await main();
