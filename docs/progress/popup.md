# 弹出层 Popup · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/popup/`
- 文档页：`/popup`（`packages/docs/src/app/docs/popup/popup.component.ts`）
- 状态：🚧 有深度债 7 项

## 概览

| 指标 | 数值 |
| --- | --- |
| 上游属性 | 24 |
| 已对齐 | 12 |
| 覆盖率 | 50.0% |
| 深度债 | 7（D1 0 / D2 7 / D3 0） |
| Angular 惯用映射 | 5（插槽 / 双向绑定 / 事件名，不计债） |
| 未登记缺失 | 0 |
| 文档示例 | 5 个 |

## 组件明细

### `TPopup`（`<t-popup>`）

上游接口 `TdPopupProps`；上游属性 24、已对齐 12（50.0%）；深度债 7 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `content` | string \| undefined | undefined | 弹层内容（纯文本） |
| `placement` | PopupPlacement | 'top' | 弹层位置 |
| `trigger` | PopupTrigger | 'hover' | 触发方式 |
| `delay` | number \| number[] | 0 | 显示/隐藏的延迟毫秒数，数组形式为 [显示延迟, 隐藏延迟] |
| `disabled` | boolean | false | 是否禁用弹出 |
| `showArrow` | boolean | true | 是否显示箭头 |
| `destroyOnClose` | boolean | false | 关闭时是否销毁弹层内容 |
| `hideEmptyPopup` | boolean | false | 内容为空时是否隐藏弹层 |
| `overlayClassName` | string \| string[] \| Record<string, boolean> \| null | null | 弹层根元素的附加类名 |
| `overlayInnerClassName` | string \| string[] \| Record<string, boolean> \| null | null | 弹层内容元素的附加类名 |
| `ignoreOutsideSelector` | string \| undefined | undefined | 点击该选择器匹配的元素时不视为「弹层外部」，用于弹层内嵌其它 CDK 弹层（如日期面板里的月份下拉） |
| `visible` | boolean \| undefined | undefined | 受控的展开状态 |
| `zIndex` | number \| undefined | undefined | 弹层层级 |

**已实现事件**

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `visibleChange` | boolean | 展开状态变化，用于双向绑定 |
| `overlayClick` | MouseEvent | 点击弹层内容 |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `attach` | D2 录入与反馈线 | 弹层固定挂到 body（CDK overlay），暂不支持自定义挂载点 |
| `default` | Angular 惯用映射 | 触发器与内容都通过 ng-content 投影，不需要 default 插槽属性 |
| `defaultVisible` | Angular 惯用映射 | Angular 用 [visible] 作为受控初始值 |
| `modelValue` | Angular 惯用映射 | Angular 用 [(visible)] 双向绑定 |
| `onOverlayClick` | Angular 惯用映射 | Angular 用 (overlayClick) 输出 |
| `onScroll` | D2 录入与反馈线 | 暂未暴露内容区滚动事件，可直接监听原生 scroll |
| `onScrollToBottom` | D2 录入与反馈线 | 暂未暴露滚动到底事件，可直接监听原生 scroll |
| `onVisibleChange` | Angular 惯用映射 | Angular 用 (visibleChange) 输出 |
| `overlayInnerStyle` | D2 录入与反馈线 | 样式通过 [overlayInnerClassName] 或全局 CSS 控制 |
| `overlayStyle` | D2 录入与反馈线 | 样式通过 [overlayClassName] 或全局 CSS 控制 |
| `popperOptions` | D2 录入与反馈线 | 定位由 CDK Overlay 负责，不透传 popper 配置 |
| `triggerElement` | D2 录入与反馈线 | 触发元素就是默认投影的内容 |

## 文档示例

- `packages/docs/src/app/docs/popup/demos/popup-arrow.ts`
- `packages/docs/src/app/docs/popup/demos/popup-basic.ts`
- `packages/docs/src/app/docs/popup/demos/popup-content.ts`
- `packages/docs/src/app/docs/popup/demos/popup-placement.ts`
- `packages/docs/src/app/docs/popup/demos/popup-trigger.ts`
