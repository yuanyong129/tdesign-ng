#!/usr/bin/env node
/**
 * 把本仓库组件的 API 与 tdesign-vue-next 的 props 定义做机器比对。
 *
 * 目的：P1 逐个重写组件时，靠人眼比文档一定会漏属性。这个脚本产出两个清单——
 *   missing：上游有、我们没有（要做的工作）
 *   extra  ：我们有、上游没有（多半是 Arco 遗留，要删）
 *
 * 数据来源是 tdesign-vue-next 发布包里的 `es/<component>/type.d.ts`，
 * 这是它的公开类型契约（比读源码 props.ts 更稳，不受内部实现影响）。
 *
 * 用法：
 *   node scripts/align-check.mjs              # 打印报告
 *   node scripts/align-check.mjs --strict     # 有任何 missing 就退出码 1（CI 用）
 *   node scripts/align-check.mjs --component TButton
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const API_FILE = path.join(ROOT, 'packages/docs/src/app/api/api.generated.json');
const CACHE_DIR = path.join(ROOT, '.local-cache/upstream');

/** 锁定的上游版本。升级时刻意为之，不跟随 latest，避免报告噪音。 */
const UPSTREAM_VERSION = '1.20.11';
const UPSTREAM_BASE = `https://unpkg.com/tdesign-vue-next@${UPSTREAM_VERSION}/es`;

/**
 * Angular 侧用 `(blur)` `(change)` 之类的输出代替 Vue 的 `onXxx` 回调，
 * 这类差异对所有组件都一样，集中说明一次。
 */
const ANGULAR_EVENT_IGNORES = {
  onBlur: 'Angular 用 (blur) 输出',
  onChange: 'Angular 用 (change) 输出，参数是 { value, event }',
  onFocus: 'Angular 用 (focus) 输出',
  onKeydown: 'Angular 用 (keydown) 输出',
  onKeyup: 'Angular 用 (keyup) 输出',
  onKeypress: '已由 (keydown)/(keyup) 覆盖',
  onEnter: 'Angular 用 (enter) 输出',
  onClick: 'Angular 用 (click) 输出',
};

/**
 * 每个组件的对齐配置。
 * - upstream：上游组件目录名；为 null 表示 TDesign 没有对应组件（Arco 独有，P1 会删除）
 * - renames：上游属性名 -> 我们的输入属性名（语义等价但命名不同）
 * - angularOnly：我们有意多出来的输入属性（Angular 平台特性），不计入 extra
 * - ignoreUpstream：上游属性里我们决定不支持的部分（需写明理由）
 */
const CONFIG = {
  TButton: {
    upstream: 'button',
    // 上游的 type 是原生 button 的 submit/reset/button，我们的 type 语义一致；
    // TDesign 的主题与形态分别是 theme / variant，P1 已按上游拆分。
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      content: 'Angular 用 <ng-content> 承载插槽内容，不是输入属性',
      default: '同 content，Vue 的默认插槽',
      icon: 'Angular 用 <t-icon tButtonIcon> 投影，不是输入属性',
      suffix: 'Angular 用 <span tButtonSuffix> 投影，不是输入属性',
      onClick: 'Angular 用 (click) 输出，不是输入属性',
      'loadingProps': 'Angular 侧用 [loading] 搭配 t-loading 指令实现，P1 定',
    },
  },
  TButtonGroup: { upstream: null, reason: 'TDesign 没有 button-group 组件，用 space + variant 组合替代' },
  TDivider: {
    upstream: 'divider',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      content: 'Angular 用 <ng-content> 承载分割线文字',
      default: '同 content，Vue 的默认插槽',
    },
  },
  TLink: {
    upstream: 'link',
    renames: {},
    // 上游用 prefixIcon / suffixIcon 插槽判断是否渲染图标占位，
    // Angular 侧投影内容无法在模板里判断空，改用显式布尔开关。
    angularOnly: ['hasPrefixIcon', 'hasSuffixIcon'],
    ignoreUpstream: {
      content: 'Angular 用 <ng-content> 承载链接文字',
      default: '同 content，Vue 的默认插槽',
      prefixIcon: 'Angular 用 <t-icon tLinkPrefixIcon> 投影，配合 [hasPrefixIcon] 留出间距',
      suffixIcon: 'Angular 用 <t-icon tLinkSuffixIcon> 投影，配合 [hasSuffixIcon] 留出间距',
      onClick: 'Angular 用 (click) 输出，不是输入属性',
    },
  },
  TSpace: { upstream: 'space', renames: {}, angularOnly: [], ignoreUpstream: {} },
  TSwitch: {
    upstream: 'switch',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      ...ANGULAR_EVENT_IGNORES,
      'modelValue': 'Angular 用 [(value)] 双向绑定 + ControlValueAccessor',
      'defaultValue': 'Angular 用 [value] 初始值 + ControlValueAccessor',
    },
  },
  TRadio: {
    upstream: 'radio',
    upstreamInterface: 'TdRadioProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      ...ANGULAR_EVENT_IGNORES,
      'modelValue': 'Angular 用 [(checked)] 双向绑定 + ControlValueAccessor',
      'defaultChecked': 'Angular 用 [checked] 作为受控初始值',
      'default': '内容通过 ng-content 投影，无需 default 插槽属性',
    },
  },
  TRadioGroup: {
    upstream: 'radio',
    upstreamInterface: 'TdRadioGroupProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      ...ANGULAR_EVENT_IGNORES,
      'modelValue': 'Angular 用 [(value)] 双向绑定 + ControlValueAccessor',
      'defaultValue': 'Angular 用 [value] 作为受控初始值',
    },
  },
  TCheckbox: {
    upstream: 'checkbox',
    upstreamInterface: 'TdCheckboxProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      ...ANGULAR_EVENT_IGNORES,
      'modelValue': 'Angular 用 [(checked)] 双向绑定 + ControlValueAccessor',
      'defaultChecked': 'Angular 用 [checked] 作为受控初始值',
      'default': '内容通过 ng-content 投影，无需 default 插槽属性',
      'lazyLoad': 'Angular 组件按需渲染，没有延迟加载的等价概念',
    },
  },
  TCheckboxGroup: {
    upstream: 'checkbox',
    upstreamInterface: 'TdCheckboxGroupProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      ...ANGULAR_EVENT_IGNORES,
      'modelValue': 'Angular 用 [(value)] 双向绑定 + ControlValueAccessor',
      'defaultValue': 'Angular 用 [value] 作为受控初始值',
      'lazyLoad': 'Angular 组件按需渲染，没有延迟加载的等价概念',
    },
  },
  TInput: {
    upstream: 'input',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      ...ANGULAR_EVENT_IGNORES,
      'prefixIcon': 'Angular 用 <t-icon tInputPrefixIcon> 投影，不是输入属性',
      'suffixIcon': '同 prefixIcon，用 <t-icon tInputSuffixIcon> 投影',
      'suffix': 'Angular 用 <ng-content select="[tInputSuffix]"> 承载任意后置内容',
      'modelValue': 'Angular 用 [(value)] 双向绑定 + ControlValueAccessor',
      'defaultValue': 'Angular 用 [value] 初始值 + ControlValueAccessor',
      'onClear': 'Angular 用 (clear) 输出',
      'onCompositionstart': '组合输入事件暂未单独暴露，可用 (keydown)/(change) 覆盖',
      'onCompositionend': '同上',
      'onMouseenter': 'Angular 可直接在原生的宿主元素上监听',
      'onMouseleave': '同上',
      'onPaste': '暂未单独暴露，需要时可监听原生 paste 事件',
      'onValidate': '数值越界校验由 t-form 承担，P2 表单落地后再补',
      'onWheel': '暂未暴露，需要时可监听原生 wheel 事件',
      'inputClass': 'Angular 用 [class] 直接传，或在外层包一个元素',
      'autoWidth': '暂未实现，用 style 指定宽度即可',
      'separate': 'input-group 的属性，P2 做 t-input-group 时处理',
    },
  },
  TTextarea: {
    upstream: 'textarea',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      ...ANGULAR_EVENT_IGNORES,
      'modelValue': 'Angular 用 [(value)] 双向绑定 + ControlValueAccessor',
      'defaultValue': 'Angular 用 [value] 初始值 + ControlValueAccessor',
      'onValidate': '数值越界校验由 t-form 承担，P2 表单落地后再补',
    },
  },
  TSelect: {
    upstream: 'select',
    upstreamInterface: 'TdSelectProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      ...ANGULAR_EVENT_IGNORES,
      'modelValue': 'Angular 用 [(value)] 双向绑定 + ControlValueAccessor',
      'defaultValue': 'Angular 用 [value] 作为受控初始值',
      'prefixIcon': 'Angular 用 <t-icon tSelectPrefixIcon> 投影，不是输入属性',
      'suffixIcon': '同 prefixIcon，用 <t-icon tSelectSuffixIcon> 投影',
      'suffix': 'Angular 用 <ng-content select="[tSelectSuffix]"> 承载任意后置内容',
      'popupVisible': '尚未实现受控展开，先用 (popupVisibleChange) 观察状态',
      'valueDisplay': '自定义回显内容尚未实现，先由选项 label 决定',
      'valueType': '值类型恒为 SelectValue，不需要额外的类型声明',
      'keys': '选项字段名固定为 label/value/disabled，不做字段映射',
      'filter': '过滤先用内置的 label 子串匹配，暂不支持自定义过滤函数',
      'reserveKeyword': '关闭面板即清空搜索词，暂不保留',
      'collapsedItems': '多选标签折叠尚未实现',
      'minCollapsedNum': '同 collapsedItems，折叠功能未实现',
      'inputProps': '内部输入框的透传属性尚未开放',
      'selectInputProps': '同 inputProps，暂未开放',
      'tagInputProps': '标签输入相关属性暂未开放',
      'tagProps': '标签透传属性暂未开放',
      'popupProps': '面板透传属性暂未开放',
      'panelTopContent': '面板顶部自定义内容尚未实现',
      'panelBottomContent': '面板底部自定义内容尚未实现',
      'scroll': '虚拟滚动尚未实现，选项不多时直接渲染',
      'autoWidth': '宽度默认撑满父容器，需要时用 style 指定',
      'inputValue': '受控搜索词尚未开放，搜索词由组件内部维护',
      'defaultInputValue': '受控搜索词尚未开放，搜索词由组件内部维护',
      'defaultPopupVisible': '尚未实现受控展开，先用 (popupVisibleChange) 观察状态',
      'onClear': 'Angular 用 (clear) 输出',
      'onCreate': 'Angular 用 (create) 输出',
      'onRemove': 'Angular 用 (remove) 输出',
      'onSearch': 'Angular 用 (search) 输出',
      'onPopupVisibleChange': 'Angular 用 (popupVisibleChange) 输出',
      'onInputChange': '搜索词变化统一走 (search)，不再单独暴露输入事件',
    },
  },
  TScrollbar: { upstream: null, reason: 'TDesign 没有 scrollbar 组件，属于 Arco 独有能力，P1 移除' },
  TThumb: { upstream: null, reason: '内部实现组件，不对外' },
  TForm: {
    upstream: 'form',
    upstreamInterface: 'TdFormProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {
      ...ANGULAR_EVENT_IGNORES,
      'data': 'Angular 用 ngModel/FormGroup 承载表单数据，不需要 data 输入',
      'id': '宿主元素的 id 交给使用方设置，框架不覆盖',
      'readonly': '只读由各控件自身的 readonly 控制，表单级只提供 disabled',
      'onReset': 'Angular 用 (reset) 输出',
      'onSubmit': 'Angular 用 (submit) 输出',
      'onValidate': 'Angular 用 (validate) 输出',
    },
  },
  TFormItem: {
    upstream: 'form',
    upstreamInterface: 'TdFormItemProps',
    renames: {},
    angularOnly: [],
    ignoreUpstream: {},
  },
};

const argv = process.argv.slice(2);
const STRICT = argv.includes('--strict');
const ONLY = argv.includes('--component') ? argv[argv.indexOf('--component') + 1] : null;

/** 读取（并缓存）上游某个组件的 type.d.ts。 */
async function fetchUpstreamTypes(componentDir) {
  const cacheFile = path.join(CACHE_DIR, `${UPSTREAM_VERSION}-${componentDir}-type.d.ts`);
  try {
    return await fs.readFile(cacheFile, 'utf8');
  } catch {
    // 未缓存，走网络。
  }
  const url = `${UPSTREAM_BASE}/${componentDir}/type.d.ts`;
  const res = await fetch(url, { redirect: 'follow' });
  if (!res.ok) throw new Error(`拉取失败 ${url}: HTTP ${res.status}`);
  const text = await res.text();
  await fs.mkdir(CACHE_DIR, { recursive: true });
  await fs.writeFile(cacheFile, text, 'utf8');
  return text;
}

/** 从 .d.ts 里解析出 props 接口的成员。 */
function parseProps(text, componentDir, interfaceName) {
  const source = ts.createSourceFile('type.d.ts', text, ts.ScriptTarget.Latest, true);
  const members = new Map();
  // 部分上游组件把单个与分组的 props 放在同一个 type.d.ts 里（如 checkbox、radio），
  // 这时必须按接口名精确取值，否则会把另一组件的属性算成 missing。
  const matches = (name) => (/^Td.*Props$/.test(name) ? !interfaceName || name === interfaceName : false);

  const collectFromTypeLiteral = (literal) => {
    for (const m of literal.members) {
      if (!ts.isPropertySignature(m) || !m.name) continue;
      const name = ts.isIdentifier(m.name) || ts.isStringLiteral(m.name) ? m.name.text : m.name.getText(source);
      members.set(name, {
        name,
        optional: !!m.questionToken,
        type: m.type?.getText(source) ?? 'any',
      });
    }
  };

  const visit = (node) => {
    if (ts.isInterfaceDeclaration(node)) {
      // 约定：props 接口名形如 TdXxxProps
      if (matches(node.name.text)) {
        for (const m of node.members) {
          if (!ts.isPropertySignature(m) || !m.name) continue;
          const name = ts.isIdentifier(m.name) || ts.isStringLiteral(m.name) ? m.name.text : m.name.getText(source);
          members.set(name, {
            name,
            optional: !!m.questionToken,
            type: m.type?.getText(source) ?? 'any',
          });
        }
      }
    }
    if (ts.isTypeAliasDeclaration(node) && matches(node.name.text) && ts.isTypeLiteralNode(node.type)) {
      collectFromTypeLiteral(node.type);
    }
    ts.forEachChild(node, visit);
  };
  visit(source);

  if (!members.size) throw new Error(`${componentDir}/type.d.ts 里没找到 Td*Props 接口`);
  return members;
}

function formatList(names) {
  return names.length ? names.join(', ') : '—';
}

async function main() {
  const api = JSON.parse(await fs.readFile(API_FILE, 'utf8'));
  let totalMissing = 0;
  let totalExtra = 0;
  const rows = [];

  for (const [className, cfg] of Object.entries(CONFIG)) {
    if (ONLY && className !== ONLY) continue;
    const ours = api.components[className];
    if (!ours) {
      rows.push({ className, status: 'skip', note: 'API 数据里没有这个组件' });
      continue;
    }

    if (!cfg.upstream) {
      rows.push({ className, status: 'n/a', note: cfg.reason ?? '上游没有对应组件' });
      continue;
    }

    let upstream;
    try {
      upstream = parseProps(await fetchUpstreamTypes(cfg.upstream), cfg.upstream, cfg.upstreamInterface);
    } catch (err) {
      rows.push({ className, status: 'error', note: err.message });
      continue;
    }

    const ourNames = new Set(ours.inputs.map((i) => i.name));
    const renamedFrom = new Map(Object.entries(cfg.renames ?? {}));
    const angularOnly = new Set(cfg.angularOnly ?? []);
    const ignoreUpstream = cfg.ignoreUpstream ?? {};

    const missing = [];
    const present = [];
    for (const name of upstream.keys()) {
      if (name in ignoreUpstream) continue;
      const mapped = renamedFrom.get(name) ?? name;
      if (ourNames.has(mapped)) present.push(name);
      else missing.push(name);
    }

    const upstreamMapped = new Set(
      [...upstream.keys()].filter((n) => !(n in ignoreUpstream)).map((n) => renamedFrom.get(n) ?? n),
    );
    const extra = ours.inputs
      .map((i) => i.name)
      .filter((n) => !upstreamMapped.has(n) && !angularOnly.has(n));

    totalMissing += missing.length;
    totalExtra += extra.length;

    console.log(`\n${className}  (上游 ${cfg.upstream}@${UPSTREAM_VERSION})`);
    console.log(`  已对齐 ${present.length}/${upstream.size}`);
    console.log(`  missing (${missing.length}): ${formatList(missing)}`);
    console.log(`  extra   (${extra.length}): ${formatList(extra)}`);
    if (missing.length) {
      console.log('  missing 明细:');
      for (const name of missing) {
        const p = upstream.get(name);
        console.log(`    - ${name}${p.optional ? '?' : ''}: ${p.type.replace(/\s+/g, ' ').slice(0, 90)}`);
      }
    }
  }

  for (const row of rows) {
    console.log(`\n${row.className}: ${row.status} —— ${row.note}`);
  }

  console.log(`\n合计：missing ${totalMissing} 项，extra ${totalExtra} 项。`);

  if (STRICT && totalMissing > 0) {
    console.error('\n--strict 失败：仍有未对齐的上游属性。');
    process.exit(1);
  }
}

await main();
