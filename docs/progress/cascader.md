# Cascader 级联组件 · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/cascader/`
- 文档页：`/cascader`（`packages/docs/src/app/docs/cascader/cascader.component.ts`）
- 状态：🚧 有深度债 25 项

## 概览

| 指标 | 数值 |
| --- | --- |
| 上游属性 | 53 |
| 已对齐 | 22 |
| 覆盖率 | 41.5% |
| 深度债 | 25（D1 25 / D2 0 / D3 0） |
| Angular 惯用映射 | 6（插槽 / 双向绑定 / 事件名，不计债） |
| 未登记缺失 | 0 |
| 文档示例 | 7 个 |

## 组件明细

### `TCascader`（`<t-cascader>`）

上游接口 `TdCascaderProps`；上游属性 53、已对齐 22（41.5%）；深度债 25 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `options` | CascaderOption[] | [] | 级联选项数据。 |
| `value` | CascaderValue \| undefined | undefined | 选中值，受控用法。多选时为值数组。 |
| `defaultValue` | CascaderValue \| undefined | undefined | 默认选中值，非受控用法。 |
| `keys` | CascaderKeys | {} | 自定义字段名，默认 label / value / children。 |
| `showAllLevels` | boolean | true | 面板展开时是否显示完整路径（父级 / 子级），为 false 时只显示最后一级。 |
| `clearable` | boolean | false | 是否可清空。 |
| `disabled` | boolean | false | 是否禁用。 |
| `popupProps` | PopupOptions \| undefined | undefined | 透传给弹层的选项（`delay` / `zIndex` / `overlayClassName` 等）；`placement` / `trigger` 由组件内部约定。 |
| `size` | 'small' \| 'medium' \| 'large' | 'medium' | 输入框尺寸。 |
| `placeholder` | string | '请选择' | 占位文案。 |
| `empty` | string | '暂无数据' | 无选项时的提示文案。 |
| `multiple` | boolean | false | 是否多选。 |
| `checkStrictly` | boolean | false | 父子节点是否不关联：为 true 时勾选父节点不再连带子节点。 |
| `valueMode` | CascaderValueMode | 'onlyLeaf' | 多选时的取值模式。 - `onlyLeaf`：只包含叶子节点；`parentFirst`：父节点全选时取父节点；`all`：父子节点都包含。 |
| `max` | number | 0 | 多选上限，0 表示不限制。 |
| `filterable` | boolean | false | 是否可搜索。打开后在输入框里输入关键字，面板切换成扁平的结果列表。 |
| `filter` | ((filterWords: string, option: CascaderOption) => boolean) \| undefined | undefined | 自定义搜索函数，签名为 `(keyword, option) => boolean`（只支持同步返回）。 |
| `reserveKeyword` | boolean | true | 选中后是否保留搜索关键字。 |
| `lazy` | boolean | true | 是否按需加载子节点；配合 `load` 使用，点击没有子节点的选项时触发加载。 |
| `load` | ((option: CascaderOption) => Promise<CascaderOption[]>) \| undefined | undefined | 异步加载子节点，返回子节点数组。 |
| `loading` | boolean | false | 是否处于加载中。 |
| `loadingText` | string | '加载中' | 加载中的提示文案。 |

**已实现事件**

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `change` | CascaderChangeEvent | 选中值变化时触发。 |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `autofocus` | D1 表格与选择线 | 自动聚焦在后续版本实现 |
| `borderless` | D1 表格与选择线 | 无边框模式在后续版本实现 |
| `checkProps` | D1 表格与选择线 | 多选复选框配置属于透传，Angular 侧不暴露 |
| `collapsedItems` | D1 表格与选择线 | 多选折叠在后续版本实现 |
| `columnFooter` | D1 表格与选择线 | 自定义列尾在后续版本实现 |
| `columnHeader` | D1 表格与选择线 | 自定义列头在后续版本实现 |
| `inputProps` | D1 表格与选择线 | 透传 InputProps 在后续版本实现 |
| `label` | D1 表格与选择线 | 标签文案在后续版本实现 |
| `minCollapsedNum` | D1 表格与选择线 | 多选折叠在后续版本实现 |
| `modelValue` | Angular 惯用映射 | Angular 用 value 双向绑定 |
| `onBlur` | D1 表格与选择线 | 失焦事件在后续版本实现 |
| `onChange` | Angular 惯用映射 | Angular 用 (change) 输出 |
| `onFocus` | D1 表格与选择线 | 聚焦事件在后续版本实现 |
| `onPopupVisibleChange` | Angular 惯用映射 | Angular 用 (visibleChange) 输出 |
| `onRemove` | D1 表格与选择线 | 多选删除在后续版本实现 |
| `option` | D1 表格与选择线 | 自定义选项渲染在后续版本实现 |
| `panelBottomContent` | Angular 惯用映射 | Angular 用 <ng-template tCascaderPanelBottom> 投影 |
| `panelTopContent` | Angular 惯用映射 | Angular 用 <ng-template tCascaderPanelTop> 投影 |
| `popupVisible` | D1 表格与选择线 | 受控弹层显隐在后续版本实现 |
| `prefixIcon` | D1 表格与选择线 | 前缀图标在后续版本实现 |
| `readonly` | D1 表格与选择线 | 只读模式在后续版本实现 |
| `selectInputProps` | D1 表格与选择线 | 透传 SelectInputProps 在后续版本实现 |
| `status` | D1 表格与选择线 | 校验状态在后续版本实现 |
| `suffix` | D1 表格与选择线 | 后缀内容在后续版本实现 |
| `suffixIcon` | D1 表格与选择线 | 后缀图标在后续版本实现 |
| `tagInputProps` | D1 表格与选择线 | 多选标签配置在后续版本实现 |
| `tagProps` | D1 表格与选择线 | 多选标签配置在后续版本实现 |
| `tips` | D1 表格与选择线 | 提示文案在后续版本实现 |
| `trigger` | D1 表格与选择线 | 只支持 click 触发 |
| `valueDisplay` | Angular 惯用映射 | Angular 用 <ng-template tCascaderValueDisplay> 投影 |
| `valueType` | D1 表格与选择线 | valueType 在后续版本实现 |

## 文档示例

- `packages/docs/src/app/docs/cascader/demos/cascader-basic.ts`
- `packages/docs/src/app/docs/cascader/demos/cascader-filter.ts`
- `packages/docs/src/app/docs/cascader/demos/cascader-lazy.ts`
- `packages/docs/src/app/docs/cascader/demos/cascader-levels.ts`
- `packages/docs/src/app/docs/cascader/demos/cascader-multiple.ts`
- `packages/docs/src/app/docs/cascader/demos/cascader-options.ts`
- `packages/docs/src/app/docs/cascader/demos/cascader-slot.ts`
