# 选择器 Select · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/select/`
- 文档页：`/select`（`packages/docs/src/app/docs/select/select.component.ts`）
- 状态：🚧 有深度债 22 项

## 概览

| 指标 | 数值 |
| --- | --- |
| 上游属性 | 55 |
| 已对齐 | 20 |
| 覆盖率 | 36.4% |
| 深度债 | 22（D1 22 / D2 0 / D3 0） |
| Angular 惯用映射 | 13（插槽 / 双向绑定 / 事件名，不计债） |
| 未登记缺失 | 0 |
| 文档示例 | 7 个 |

## 组件明细

### `TSelect`（`<t-select>`）

上游接口 `TdSelectProps`；上游属性 55、已对齐 20（36.4%）；深度债 22 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | SelectSingleValue \| SelectMultipleValue \| undefined | undefined | 已选中的值，多选时是数组 |
| `options` | SelectOptionInput[] | [] | 选项列表，支持直接给值、选项对象与分组 |
| `multiple` | boolean | false | 是否多选 |
| `filterable` | boolean | false | 是否可搜索 |
| `clearable` | boolean | false | 是否可清空 |
| `creatable` | boolean | false | 是否允许创建新选项 |
| `disabled` | boolean | false | 是否禁用 |
| `readonly` | boolean | false | 是否只读 |
| `loading` | boolean | false | 是否加载中 |
| `loadingText` | string | '加载中' | 加载中的提示文字 |
| `empty` | string | '暂无数据' | 没有选项时的提示文字 |
| `placeholder` | string \| undefined | undefined | 占位文字 |
| `size` | SelectSize | 'medium' | 选择器尺寸 |
| `status` | SelectStatus | 'default' | 选择器状态 |
| `tips` | string \| undefined | undefined | 选择框下方的提示文字 |
| `label` | string \| undefined | undefined | 左侧标签文字 |
| `showArrow` | boolean | true | 是否显示下拉箭头 |
| `borderless` | boolean | false | 是否无边框 |
| `autofocus` | boolean | false | 自动聚焦 |
| `max` | number \| undefined | undefined | 多选时最多能选中的数量 |

**已实现事件**

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `valueChange` | SelectSingleValue \| SelectMultipleValue | 值变化事件，用于双向绑定 |
| `change` | SelectChangeEvent | 值变化事件，携带触发来源与选项 |
| `popupVisibleChange` | boolean | 下拉面板展开状态变化 |
| `create` | string | 创建新选项 |
| `clear` | MouseEvent | 清空已选值 |
| `remove` | { value: SelectValue; option?: SelectOptionObj; event: Event } | 移除一个已选标签 |
| `search` | string | 搜索关键词变化 |
| `focus` | FocusEvent | 获得焦点 |
| `blur` | FocusEvent | 失去焦点 |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `autoWidth` | D1 表格与选择线 | 宽度默认撑满父容器，需要时用 style 指定 |
| `collapsedItems` | D1 表格与选择线 | 多选标签折叠尚未实现 |
| `defaultInputValue` | D1 表格与选择线 | 受控搜索词尚未开放，搜索词由组件内部维护 |
| `defaultPopupVisible` | D1 表格与选择线 | 尚未实现受控展开，先用 (popupVisibleChange) 观察状态 |
| `defaultValue` | Angular 惯用映射 | Angular 用 [value] 作为受控初始值 |
| `filter` | D1 表格与选择线 | 过滤先用内置的 label 子串匹配，暂不支持自定义过滤函数 |
| `inputProps` | D1 表格与选择线 | 内部输入框的透传属性尚未开放 |
| `inputValue` | D1 表格与选择线 | 受控搜索词尚未开放，搜索词由组件内部维护 |
| `keys` | D1 表格与选择线 | 选项字段名固定为 label/value/disabled，不做字段映射 |
| `minCollapsedNum` | D1 表格与选择线 | 同 collapsedItems，折叠功能未实现 |
| `modelValue` | Angular 惯用映射 | Angular 用 [(value)] 双向绑定 + ControlValueAccessor |
| `onBlur` | Angular 惯用映射 | Angular 用 (blur) 输出 |
| `onChange` | Angular 惯用映射 | Angular 用 (change) 输出，参数是 { value, event } |
| `onClear` | Angular 惯用映射 | Angular 用 (clear) 输出 |
| `onCreate` | Angular 惯用映射 | Angular 用 (create) 输出 |
| `onEnter` | Angular 惯用映射 | Angular 用 (enter) 输出 |
| `onFocus` | Angular 惯用映射 | Angular 用 (focus) 输出 |
| `onInputChange` | D1 表格与选择线 | 搜索词变化统一走 (search)，不再单独暴露输入事件 |
| `onPopupVisibleChange` | Angular 惯用映射 | Angular 用 (popupVisibleChange) 输出 |
| `onRemove` | Angular 惯用映射 | Angular 用 (remove) 输出 |
| `onSearch` | Angular 惯用映射 | Angular 用 (search) 输出 |
| `panelBottomContent` | D1 表格与选择线 | 面板底部自定义内容尚未实现 |
| `panelTopContent` | D1 表格与选择线 | 面板顶部自定义内容尚未实现 |
| `popupProps` | D1 表格与选择线 | 面板透传属性暂未开放 |
| `popupVisible` | D1 表格与选择线 | 尚未实现受控展开，先用 (popupVisibleChange) 观察状态 |
| `prefixIcon` | Angular 惯用映射 | Angular 用 <t-icon tSelectPrefixIcon> 投影，不是输入属性 |
| `reserveKeyword` | D1 表格与选择线 | 关闭面板即清空搜索词，暂不保留 |
| `scroll` | D1 表格与选择线 | 虚拟滚动尚未实现，选项不多时直接渲染 |
| `selectInputProps` | D1 表格与选择线 | 同 inputProps，暂未开放 |
| `suffix` | Angular 惯用映射 | Angular 用 <ng-content select="[tSelectSuffix]"> 承载任意后置内容 |
| `suffixIcon` | D1 表格与选择线 | 同 prefixIcon，用 <t-icon tSelectSuffixIcon> 投影 |
| `tagInputProps` | D1 表格与选择线 | 标签输入相关属性暂未开放 |
| `tagProps` | D1 表格与选择线 | 标签透传属性暂未开放 |
| `valueDisplay` | D1 表格与选择线 | 自定义回显内容尚未实现，先由选项 label 决定 |
| `valueType` | D1 表格与选择线 | 值类型恒为 SelectValue，不需要额外的类型声明 |

## 文档示例

- `packages/docs/src/app/docs/select/demos/select-basic.ts`
- `packages/docs/src/app/docs/select/demos/select-creatable.ts`
- `packages/docs/src/app/docs/select/demos/select-filterable.ts`
- `packages/docs/src/app/docs/select/demos/select-group.ts`
- `packages/docs/src/app/docs/select/demos/select-multiple.ts`
- `packages/docs/src/app/docs/select/demos/select-size.ts`
- `packages/docs/src/app/docs/select/demos/select-state.ts`
