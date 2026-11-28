# Popconfirm 气泡确认框 · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/popconfirm/`
- 文档页：`/popconfirm`（`packages/docs/src/app/docs/popconfirm/popconfirm.component.ts`）
- 状态：✅ 已对齐上游全部属性

## 概览

| 指标 | 数值 |
| --- | --- |
| 上游属性 | 16 |
| 已对齐 | 12 |
| 覆盖率 | 75.0% |
| 深度债 | 0（D1 0 / D2 0 / D3 0） |
| Angular 惯用映射 | 4（插槽 / 双向绑定 / 事件名，不计债） |
| 未登记缺失 | 0 |
| 文档示例 | 4 个 |

## 组件明细

### `TPopconfirm`（`<t-popconfirm>`）

上游接口 `TdPopconfirmProps`；上游属性 16、已对齐 12（75.0%）；深度债 0 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `cancelBtn` | PopconfirmButton | '' | 取消按钮 |
| `confirmBtn` | PopconfirmButton | '' | 确认按钮 |
| `content` | PopconfirmContent | undefined | 确认框内容 |
| `destroyOnClose` | boolean | true | 关闭时是否销毁弹层内容 |
| `icon` | PopconfirmContent | undefined | 自定义图标 |
| `placement` | PopconfirmPlacement | 'top' | 弹层位置 |
| `popupProps` | PopupOptions \| undefined | undefined | 弹层透传选项 |
| `showArrow` | boolean | true | 是否显示箭头 |
| `theme` | PopconfirmTheme | 'default' | 主题 |
| `triggerElement` | PopconfirmContent | undefined | 触发元素 |
| `visible` | boolean \| undefined | undefined | 受控展开状态 |
| `defaultVisible` | boolean | false | 默认是否展开 |

**已实现事件**

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `confirm` | PopconfirmActionEvent | 点击确认 |
| `cancel` | PopconfirmActionEvent | 点击取消 |
| `visibleChange` | PopconfirmVisibleChangeEvent | 展开状态变化 |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `default` | Angular 惯用映射 | Angular 用 <ng-content> / triggerElement 承载触发器 |
| `onCancel` | Angular 惯用映射 | Angular 用 (cancel) 输出，参数 { e } |
| `onConfirm` | Angular 惯用映射 | Angular 用 (confirm) 输出，参数 { e } |
| `onVisibleChange` | Angular 惯用映射 | Angular 用 (visibleChange) 输出，参数 { visible, trigger, e? }（对齐上游两段式参数） |

## 文档示例

- `packages/docs/src/app/docs/popconfirm/demos/popconfirm-async.ts`
- `packages/docs/src/app/docs/popconfirm/demos/popconfirm-base.ts`
- `packages/docs/src/app/docs/popconfirm/demos/popconfirm-popup-props.ts`
- `packages/docs/src/app/docs/popconfirm/demos/popconfirm-theme.ts`
