# 标签输入框 TagInput · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/tag-input/`
- 文档页：`/tag-input`（`packages/docs/src/app/docs/tag-input/tag-input.component.ts`）
- 状态：🚧 有深度债 1 项

## 概览

| 指标 | 数值 |
| --- | --- |
| 上游属性 | 39 |
| 已对齐 | 26 |
| 覆盖率 | 66.7% |
| 深度债 | 1（D1 0 / D2 0 / D3 1） |
| Angular 惯用映射 | 12（插槽 / 双向绑定 / 事件名，不计债） |
| 未登记缺失 | 0 |
| 文档示例 | 4 个 |

## 组件明细

### `TTagInput`（`<t-tag-input>`）

上游接口 `TdTagInputProps`；上游属性 39、已对齐 26（66.7%）；深度债 1 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | TagInputValue \| undefined | undefined | 标签列表 |
| `defaultValue` | TagInputValue | [] | 初始标签列表 |
| `inputValue` | string \| undefined | undefined | 输入框内容 |
| `inputProps` | InputOptions \| undefined | undefined | 原生编辑区配置，支持 InputOptions 白名单，标签值与输入值仍由本组件管理 |
| `tagProps` | TagInputTagProps \| undefined | undefined | 标签外观与关闭配置，尺寸、内容和删除流程由本组件管理 |
| `defaultInputValue` | string | '' | 初始输入内容 |
| `placeholder` | string \| undefined | undefined | 占位文字 |
| `size` | TagInputSize | medium | 尺寸 |
| `status` | TagInputStatus | default | 状态 |
| `max` | number \| undefined | undefined | 最大标签数量 |
| `minCollapsedNum` | number | 0 | 折叠时保留数量 |
| `excessTagsDisplayType` | TagInputExcessTagsDisplayType | break-line | 超出显示方式 |
| `disabled` | boolean | false | 是否禁用 |
| `readonly` | boolean | false | 是否只读 |
| `clearable` | boolean | false | 是否可清空 |
| `borderless` | boolean | false | 是否无边框 |
| `autoWidth` | boolean | false | 宽度自适应 |
| `dragSort` | boolean | false | 是否开启拖拽排序 |
| `tag` | TagInputRichText | undefined | 标签内容 |
| `collapsedItems` | TagInputRichText | undefined | 折叠标签内容 |
| `valueDisplay` | TagInputRichText | undefined | 自定义标签列表 |
| `label` | TagInputRichText | undefined | 左侧标签文字 |
| `prefixIcon` | TagInputRichText | undefined | 前缀图标 |
| `suffixIcon` | TagInputRichText | undefined | 后缀图标 |
| `suffix` | TagInputRichText | undefined | 后缀内容 |
| `tips` | TagInputRichText | undefined | 提示文字 |

**已实现事件**

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `valueChange` | TagInputValue | 标签列表变化 |
| `change` | TagInputChangeEvent | 标签列表变化（带来源） |
| `inputValueChange` | string | 输入内容变化 |
| `inputChange` | TagInputInputChangeEvent | 输入内容变化（带来源） |
| `remove` | TagInputRemoveEvent | 删除标签 |
| `dragSortChange` | TagInputDragSortEvent | 拖拽排序 |
| `enter` | TagInputEnterEvent | 按下回车 |
| `focus` | TagInputFocusEvent | 获得焦点 |
| `blur` | TagInputFocusEvent | 失去焦点 |
| `clear` | MouseEvent | 点击清空图标 |
| `mouseenter` | MouseEvent | 鼠标移入 |
| `mouseleave` | MouseEvent | 鼠标移出 |
| `paste` | TagInputPasteEvent | 粘贴 |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `modelValue` | Angular 惯用映射 | [D2] Angular 用 [(value)] 双向绑定表达 v-model |
| `onBlur` | Angular 惯用映射 | Angular 用 (blur) 输出 |
| `onChange` | Angular 惯用映射 | Angular 用 (change) 输出 |
| `onClear` | Angular 惯用映射 | Angular 用 (clear) 输出 |
| `onClick` | D3 其余组件与边角能力 | [D3] 宿主原生 (click) 已可监听，不再提供同名输出避免双触发 |
| `onDragSort` | Angular 惯用映射 | Angular 用 (dragSortChange) 输出（input dragSort 与输出同名会冲突） |
| `onEnter` | Angular 惯用映射 | Angular 用 (enter) 输出 |
| `onFocus` | Angular 惯用映射 | Angular 用 (focus) 输出 |
| `onInputChange` | Angular 惯用映射 | Angular 用 (inputChange) 输出 |
| `onMouseenter` | Angular 惯用映射 | Angular 用 (mouseenter) 输出 |
| `onMouseleave` | Angular 惯用映射 | Angular 用 (mouseleave) 输出 |
| `onPaste` | Angular 惯用映射 | Angular 用 (paste) 输出 |
| `onRemove` | Angular 惯用映射 | Angular 用 (remove) 输出 |

## 文档示例

- `packages/docs/src/app/docs/tag-input/demos/tag-input-basic.ts`
- `packages/docs/src/app/docs/tag-input/demos/tag-input-drag.ts`
- `packages/docs/src/app/docs/tag-input/demos/tag-input-max.ts`
- `packages/docs/src/app/docs/tag-input/demos/tag-input-props.ts`
