/**
 * 生成文档站的「示例源码表」。
 *
 * 文档站的每个示例都是一个独立的小组件，放在
 *   packages/docs/src/app/docs/<组件>/demos/<示例名>.ts
 * 这个脚本把它们的 `template` 字符串抽出来，产出
 *   packages/docs/src/app/docs/demo-sources.generated.json
 * 供 DemoBlock 组件在「查看代码」里展示。
 *
 * 这样做的好处：示例跑的就是它展示的代码，不可能对不上。
 *
 * 用法：
 *   node scripts/gen-demo-sources.mjs          生成
 *   node scripts/gen-demo-sources.mjs --check  只校验（CI 用，不一致则退出码 1）
 */
import { readdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DOCS_ROOT = path.join(ROOT, 'packages/docs/src/app/docs');
const TARGET = path.join(DOCS_ROOT, 'demo-sources.generated.json');
const CHECK_ONLY = process.argv.includes('--check');

/** 递归收集 demos 目录下的 .ts 文件（跳过 .spec.ts）。 */
function collectDemoFiles(dir, out = []) {
  if (!existsSync(dir)) return out;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === 'demos') {
        for (const file of readdirSync(full, { withFileTypes: true })) {
          if (!file.isFile() || !file.name.endsWith('.ts') || file.name.endsWith('.spec.ts')) continue;
          out.push(path.join(full, file.name));
        }
      } else {
        collectDemoFiles(full, out);
      }
    }
  }
  return out;
}

/**
 * 从组件源码里抽出 `template: \`...\`` 的内容。
 *
 * 只处理模板字面量形式：遇到未转义的结束反引号就收尾。
 * 示例模板里不应该出现 `${}` 插值（那是运行时求值，抽出来的源码没意义），
 * 一旦出现就直接报错，避免悄悄生成错内容。
 */
function extractTemplate(source, file) {
  const start = /template\s*:\s*`/.exec(source);
  if (!start) return null;

  let index = start.index + start[0].length;
  let result = '';

  while (index < source.length) {
    const char = source[index];
    if (char === '\\') {
      result += char + (source[index + 1] ?? '');
      index += 2;
      continue;
    }
    if (char === '`') return result;
    if (char === '$' && source[index + 1] === '{') {
      throw new Error(`${path.relative(ROOT, file)}：示例模板里出现了 \${} 插值，无法作为静态源码展示`);
    }
    result += char;
    index += 1;
  }

  throw new Error(`${path.relative(ROOT, file)}：template 字面量没有闭合`);
}

/** 去掉模板字面量的公共缩进，保留内部相对缩进。 */
function dedent(text) {
  const lines = text.replace(/\r\n/g, '\n').split('\n');
  while (lines.length && lines[0].trim() === '') lines.shift();
  while (lines.length && lines[lines.length - 1].trim() === '') lines.pop();

  const indents = lines
    .filter((line) => line.trim() !== '')
    .map((line) => /^ */.exec(line)[0].length);
  const min = indents.length ? Math.min(...indents) : 0;

  return lines.map((line) => line.slice(min)).join('\n');
}

const files = collectDemoFiles(DOCS_ROOT).sort();
const sources = {};
const missing = [];

for (const file of files) {
  const id = path.basename(file, '.ts');
  if (sources[id]) {
    throw new Error(`示例 id 重复：${id}（${path.relative(ROOT, file)}）`);
  }
  const template = extractTemplate(readFileSync(file, 'utf8'), file);
  if (template === null) {
    missing.push(path.relative(ROOT, file));
    continue;
  }
  sources[id] = dedent(template);
}

if (missing.length) {
  console.error(`以下示例文件没有 template 字面量：\n${missing.map((f) => `  ${f}`).join('\n')}`);
  process.exitCode = 1;
}

const serialized = `${JSON.stringify(sources, null, 2)}\n`;

if (CHECK_ONLY) {
  const current = existsSync(TARGET) ? readFileSync(TARGET, 'utf8') : '';
  if (current !== serialized) {
    console.error('示例源码表不是最新的，请执行 node scripts/gen-demo-sources.mjs');
    process.exitCode = 1;
  } else {
    console.log(`示例源码表已是最新（${Object.keys(sources).length} 个示例）`);
  }
} else {
  writeFileSync(TARGET, serialized, 'utf8');
  console.log(`已生成 ${path.relative(ROOT, TARGET)}：${Object.keys(sources).length} 个示例`);
}
