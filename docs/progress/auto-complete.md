# 自动补全 AutoComplete · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/auto-complete/`
- 文档页：`/auto-complete`（`packages/docs/src/app/docs/auto-complete/auto-complete.component.ts`）
- 状态：🚧 有深度债 1 项

## 概览

| 指标 | 数值 |
| --- | --- |
| 上游属性 | 32 |
| 已对齐 | 21 |
| 覆盖率 | 65.6% |
| 深度债 | 1（D1 1 / D2 0 / D3 0） |
| Angular 惯用映射 | 10（插槽 / 双向绑定 / 事件名，不计债） |
| 未登记缺失 | 0 |
| 文档示例 | 4 个 |

## 组件明细

### `TAutoComplete`（`<t-auto-complete>`）

上游接口 `TdAutoCompleteProps`；上游属性 32、已对齐 21（65.6%）；深度债 1 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `inputProps` | AutoCompleteInputProps \| undefined | undefined | 内置输入区的受支持配置 |
| `popupProps` | AutoCompletePopupProps \| undefined | undefined | 弹层外观和生命周期配置，显隐由组件管理 |
| `value` | string \| undefined | undefined | 值 |
| `defaultValue` | string \| undefined | '' | 默认值 |
| `options` | AutoCompleteOption[] | [] | 联想数据源 |
| `filter` | AutoCompleteFilter \| undefined | undefined | 自定义过滤函数 |
| `filterable` | boolean | true | 是否过滤选项 |
| `highlightKeyword` | boolean | true | 是否高亮关键字 |
| `empty` | AutoCompleteContent \| undefined | undefined | 空态内容 |
| `panelTopContent` | AutoCompleteContent \| undefined | undefined | 面板顶部内容 |
| `panelBottomContent` | AutoCompleteContent \| undefined | undefined | 面板底部内容 |
| `triggerElement` | AutoCompleteContent \| undefined | undefined | 自定义触发器 |
| `placeholder` | string \| undefined | undefined | 占位符 |
| `size` | AutoCompleteSize | medium | 尺寸 |
| `status` | AutoCompleteStatus | default | 校验状态 |
| `tips` | string \| undefined | undefined | 提示文字 |
| `borderless` | boolean | false | 是否无边框 |
| `clearable` | boolean | false | 是否可清空 |
| `disabled` | boolean | false | 是否禁用 |
| `readonly` | boolean | false | 是否只读 |
| `autofocus` | boolean | false | 是否自动聚焦 |

**已实现事件**

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `valueChange` | string | 值变化 |
| `change` | AutoCompleteChangeEvent | 值变化 |
| `select` | AutoCompleteSelectEvent | 选中选项 |
| `enter` | AutoCompleteEnterEvent | 按下回车 |
| `focus` | AutoCompleteFocusEvent | 获得焦点 |
| `blur` | AutoCompleteBlurEvent | 失去焦点 |
| `clear` | AutoCompleteClearEvent | 清空 |
| `compositionstart` | AutoCompleteCompositionEvent | 组合输入开始 |
| `compositionend` | AutoCompleteCompositionEvent | 组合输入结束 |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `default` | Angular 惯用映射 | [D2] 由 triggerElement 承接：Angular 把默认插槽与具名插槽合并成一个内容输入 |
| `modelValue` | Angular 惯用映射 | [D1] Angular 用 [(value)] 双向绑定表达 v-model |
| `onBlur` | Angular 惯用映射 | Angular 用 (blur) 输出 |
| `onChange` | Angular 惯用映射 | Angular 用 (change) 输出 |
| `onClear` | Angular 惯用映射 | Angular 用 (clear) 输出 |
| `onCompositionend` | Angular 惯用映射 | Angular 用 (compositionend) 输出 |
| `onCompositionstart` | Angular 惯用映射 | Angular 用 (compositionstart) 输出 |
| `onEnter` | Angular 惯用映射 | Angular 用 (enter) 输出 |
| `onFocus` | Angular 惯用映射 | Angular 用 (focus) 输出 |
| `onSelect` | Angular 惯用映射 | Angular 用 (select) 输出 |
| `textareaProps` | D1 表格与选择线 | [D1] 上游 auto-complete 未消费该属性 |

## 文档示例

- `packages/docs/src/app/docs/auto-complete/demos/auto-complete-basic.ts`
- `packages/docs/src/app/docs/auto-complete/demos/auto-complete-custom-option.ts`
- `packages/docs/src/app/docs/auto-complete/demos/auto-complete-options.ts`
- `packages/docs/src/app/docs/auto-complete/demos/auto-complete-remote.ts`
