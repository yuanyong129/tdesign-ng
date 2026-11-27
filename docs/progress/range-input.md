# 范围输入框 RangeInput · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/range-input/`
- 文档页：`/range-input`（`packages/docs/src/app/docs/range-input/range-input.component.ts`）
- 状态：🚧 有深度债 2 项

## 概览

| 指标 | 数值 |
| --- | --- |
| 上游属性 | 28 |
| 已对齐 | 19 |
| 覆盖率 | 67.9% |
| 深度债 | 2（D1 0 / D2 0 / D3 2） |
| Angular 惯用映射 | 7（插槽 / 双向绑定 / 事件名，不计债） |
| 未登记缺失 | 0 |
| 文档示例 | 4 个 |

## 组件明细

### `TRangeInput`（`<t-range-input>`）

上游接口 `TdRangeInputProps`；上游属性 28、已对齐 19（67.9%）；深度债 2 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `activeIndex` | number \| undefined | undefined | 高亮索引 |
| `borderless` | boolean | false | 无边框 |
| `clearable` | boolean | false | 可清空 |
| `disabled` | boolean \| boolean[] | false | 禁用 |
| `format` | RangeInputFormat \| RangeInputFormat[] \| undefined | undefined | 格式化函数 |
| `inputProps` | InputOptions \| ReadonlyArray<InputOptions> \| undefined | undefined | 编辑区的 InputOptions 配置，单对象作用于两侧，数组分别配置左右两侧 |
| `label` | string \| TemplateRef<unknown> \| undefined | undefined | 前缀内容 |
| `placeholder` | string \| string[] \| undefined | undefined | 占位文本 |
| `prefixIcon` | TemplateRef<unknown> \| undefined | undefined | 前置图标 |
| `readonly` | boolean | false | 只读 |
| `separator` | string \| TemplateRef<unknown> \| undefined | - | 分隔符 |
| `showClearIconOnEmpty` | boolean | false | 空值显示清除图标 |
| `size` | RangeInputSize | medium | 尺寸 |
| `status` | RangeInputStatus | default | 状态 |
| `suffix` | string \| TemplateRef<unknown> \| undefined | undefined | 后缀内容 |
| `suffixIcon` | TemplateRef<unknown> \| undefined | undefined | 后置图标 |
| `tips` | string \| TemplateRef<unknown> \| undefined | undefined | 提示内容 |
| `value` | RangeInputValue \| undefined | undefined | 值 |
| `defaultValue` | RangeInputValue | [] | 默认值 |

**已实现事件**

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `valueChange` | RangeInputValue | 值变化 |
| `change` | RangeInputChangeEvent | 值变化 |
| `clear` | RangeInputClearEvent | 清除 |
| `click` | RangeInputClickEvent | 点击 |
| `blur` | RangeInputFocusEvent | 失焦 |
| `enter` | RangeInputEnterEvent | 回车 |
| `focus` | RangeInputFocusEvent | 聚焦 |
| `mouseenter` | RangeInputMouseEvent | 鼠标移入 |
| `mouseleave` | RangeInputMouseEvent | 鼠标移出 |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `modelValue` | Angular 惯用映射 | [D3] Angular 用 [(value)] 双向绑定表达 v-model |
| `onBlur` | Angular 惯用映射 | Angular 用 (blur) 输出 |
| `onChange` | Angular 惯用映射 | Angular 用 (change) 输出 |
| `onClear` | Angular 惯用映射 | Angular 用 (clear) 输出 |
| `onClick` | Angular 惯用映射 | Angular 用 (click) 输出（已改名，避免与宿主原生 click 双触发） |
| `onEnter` | Angular 惯用映射 | Angular 用 (enter) 输出 |
| `onFocus` | Angular 惯用映射 | Angular 用 (focus) 输出 |
| `onMouseenter` | D3 其余组件与边角能力 | [D3] 同时提供 (mouseenter) 输出与宿主原生事件 |
| `onMouseleave` | D3 其余组件与边角能力 | [D3] 同时提供 (mouseleave) 输出与宿主原生事件 |

## 文档示例

- `packages/docs/src/app/docs/range-input/demos/range-input-advanced.ts`
- `packages/docs/src/app/docs/range-input/demos/range-input-basic.ts`
- `packages/docs/src/app/docs/range-input/demos/range-input-disabled.ts`
- `packages/docs/src/app/docs/range-input/demos/range-input-input-props.ts`
