# TreeSelect 树选择 · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/tree-select/`
- 文档页：`/tree-select`（`packages/docs/src/app/docs/tree-select/tree-select.component.ts`）
- 状态：🚧 有深度债 16 项

## 概览

| 指标 | 数值 |
| --- | --- |
| 上游属性 | 44 |
| 已对齐 | 20 |
| 覆盖率 | 45.5% |
| 深度债 | 16（D1 16 / D2 0 / D3 0） |
| Angular 惯用映射 | 8（插槽 / 双向绑定 / 事件名，不计债） |
| 未登记缺失 | 0 |
| 文档示例 | 6 个 |

## 组件明细

### `TTreeSelect`（`<t-tree-select>`）

上游接口 `TdTreeSelectProps`；上游属性 44、已对齐 20（45.5%）；深度债 16 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `data` | TreeSelectData[] | [] | 树形数据。 |
| `value` | TreeSelectValue \| undefined | undefined | 选中值，受控用法。多选时为值数组。 |
| `defaultValue` | TreeSelectValue \| undefined | undefined | 默认选中值，非受控用法。 |
| `keys` | TreeSelectKeys | {} | 自定义字段名，默认 label / value / children / disabled。 |
| `valueType` | 'value' \| 'object' | 'value' | 值的形态：`value` 返回数据项的 value，`object` 返回整个数据项。 |
| `multiple` | boolean | false | 是否多选。 |
| `max` | number | 0 | 多选上限，0 表示不限制。 |
| `minCollapsedNum` | number | 0 | 多选时最多显示几个标签，其余用 +N 折叠；0 表示全部显示。 |
| `treeProps` | TreeSelectTreeProps \| undefined | undefined | 透传给内部树的配置，当前支持 checkStrictly / valueMode / expandAll。 |
| `filterable` | boolean | false | 是否可搜索。打开后在输入框里输入关键字，树只保留命中节点及其父级。 |
| `filter` | ((filterWords: string, data: TreeSelectData) => boolean) \| undefined | undefined | 自定义搜索函数，签名为 `(keyword, data) => boolean`（只支持同步返回）。 |
| `inputValue` | string \| undefined | undefined | 受控的搜索关键字。 |
| `defaultInputValue` | string \| undefined | undefined | 默认搜索关键字。 |
| `clearable` | boolean | false | 是否可清空。 |
| `disabled` | boolean | false | 是否禁用。 |
| `size` | 'small' \| 'medium' \| 'large' | 'medium' | 输入框尺寸。 |
| `placeholder` | string | '请选择' | 占位文案。 |
| `empty` | string | '暂无数据' | 无数据时的提示文案。 |
| `loading` | boolean | false | 是否处于加载中。 |
| `loadingText` | string | '加载中' | 加载中的提示文案。 |

**已实现事件**

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `change` | TreeSelectChangeEvent | 选中值变化时触发。 |
| `visibleChange` | boolean | 弹层显隐变化 |
| `search` | string | 搜索关键字变化 |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `autoWidth` | D1 表格与选择线 | 自动宽度在后续版本实现 |
| `borderless` | D1 表格与选择线 | 无边框模式在后续版本实现 |
| `collapsedItems` | D1 表格与选择线 | 多选用内置 +N 折叠，未提供自定义折叠内容模板 |
| `inputProps` | D1 表格与选择线 | 透传 InputProps 在后续版本实现 |
| `modelValue` | Angular 惯用映射 | Angular 用 value 双向绑定 |
| `onBlur` | D1 表格与选择线 | 失焦事件在后续版本实现 |
| `onChange` | Angular 惯用映射 | Angular 用 (change) 输出 |
| `onClear` | D1 表格与选择线 | 清空已包含在 (change) 的 trigger="clear" 里 |
| `onFocus` | D1 表格与选择线 | 聚焦事件在后续版本实现 |
| `onInputChange` | Angular 惯用映射 | Angular 用 (search) 输出 |
| `onPopupVisibleChange` | Angular 惯用映射 | Angular 用 (visibleChange) 输出 |
| `onRemove` | D1 表格与选择线 | 多选删除已包含在 (change) 的 trigger="uncheck" 里 |
| `onSearch` | Angular 惯用映射 | Angular 用 (search) 输出 |
| `panelBottomContent` | Angular 惯用映射 | Angular 用 <ng-template tTreeSelectPanelBottom> 投影 |
| `panelTopContent` | Angular 惯用映射 | Angular 用 <ng-template tTreeSelectPanelTop> 投影 |
| `popupProps` | D1 表格与选择线 | 透传 PopupProps 在后续版本实现 |
| `popupVisible` | D1 表格与选择线 | 受控弹层显隐在后续版本实现 |
| `prefixIcon` | Angular 惯用映射 | Angular 用 <t-icon tTreeSelectPrefixIcon> 投影 |
| `readonly` | D1 表格与选择线 | 只读模式在后续版本实现 |
| `selectInputProps` | D1 表格与选择线 | 透传 SelectInputProps 在后续版本实现 |
| `suffix` | D1 表格与选择线 | 后缀内容在后续版本实现 |
| `suffixIcon` | D1 表格与选择线 | 后缀图标在后续版本实现 |
| `tagProps` | D1 表格与选择线 | 标签固定 maxWidth=300，未透传其他 TagProps |
| `valueDisplay` | D1 表格与选择线 | 自定义回显在后续版本实现 |

## 文档示例

- `packages/docs/src/app/docs/tree-select/demos/tree-select-basic.ts`
- `packages/docs/src/app/docs/tree-select/demos/tree-select-filter.ts`
- `packages/docs/src/app/docs/tree-select/demos/tree-select-loading.ts`
- `packages/docs/src/app/docs/tree-select/demos/tree-select-multiple.ts`
- `packages/docs/src/app/docs/tree-select/demos/tree-select-options.ts`
- `packages/docs/src/app/docs/tree-select/demos/tree-select-panel.ts`
