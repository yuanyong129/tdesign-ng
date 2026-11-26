/**
 * 深度债归类：`depth-report.mjs` 与 `gen-progress-docs.mjs` 共用同一套口径。
 *
 * 为什么单独抽出来：两处报表必须给出一样的数字，否则「进度文档说 295 条债、depth-report 说 549 条」
 * 这种漂移会直接误导排期。归类规则只有三个：
 *   1. reason 里显式写了 `[D1]` / `[D2]` / `[D3]` 的，以前缀为准；
 *   2. 否则落在组件默认归属的深度线上（与 `docs/plans/breadth-first-roadmap.md` §4.2 一致）；
 *   3. 既没有前缀、又不像欠账的（Angular 惯用映射），归为 `map`，不计入深度债。
 */

/** 组件默认归属的深度线；显式 `[D#]` 前缀优先。 */
export const LINE_DEFAULTS = {
  D1: [
    'TTable',
    'TSelect',
    'TSelectInput',
    'TCascader',
    'TTree',
    'TTreeSelect',
    'TDatePicker',
    'TDateRangePicker',
    'TTimePicker',
    'TInputNumber',
    'TAutoComplete',
  ],
  D2: [
    'TInput',
    'TTextarea',
    'TForm',
    'TFormItem',
    'TUpload',
    'TTransfer',
    'TDialog',
    'TDrawer',
    'TPopup',
    'TMenu',
    'TDropdown',
    'TGuide',
  ],
};

/**
 * 「不是欠账，只是换了说法」的 reason 特征。
 *
 * Angular 没有 Vue 的 props 式插槽/双向绑定，`modelValue`、`onChange`、`default`、`content`
 * 这类上游属性在本库是输出绑定、ng-content 或 (change) 事件，属于 API 形态差异而非未实现。
 * 这些条目照样要留在 ignoreUpstream（否则 missing 会误报），但不能算进深度债。
 */
export const MAPPING_PATTERNS = [/^Angular (用|直接)/, /双向绑定/, /ng-content/, /插槽/, /Vue 的默认插槽/];

export const BUCKET_LABELS = {
  D1: 'D1 表格与选择线',
  D2: 'D2 录入与反馈线',
  D3: 'D3 其余组件与边角能力',
  map: 'Angular 惯用映射',
};

export function isMapping(reason) {
  return MAPPING_PATTERNS.some((pattern) => pattern.test(reason ?? ''));
}

/**
 * 归类一条 `ignoreUpstream`。
 *
 * @param {string} className 组件类名（如 `TTable`）
 * @param {string} reason ignoreUpstream 的原因文本
 * @returns {{ bucket: 'D1' | 'D2' | 'D3' | 'map', explicit: boolean }}
 */
export function classifyDebt(className, reason) {
  if (isMapping(reason)) return { bucket: 'map', explicit: false };
  const explicit = /^\s*\[(D[123])\]/i.exec(reason ?? '');
  if (explicit) return { bucket: explicit[1].toUpperCase(), explicit: true };
  for (const bucket of ['D1', 'D2', 'D3']) {
    if ((LINE_DEFAULTS[bucket] ?? []).includes(className)) return { bucket, explicit: false };
  }
  return { bucket: 'D3', explicit: false };
}
