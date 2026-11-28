# Button 按钮 · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/button/`
- 文档页：`/button`（`packages/docs/src/app/docs/button/button.component.ts`）
- 状态：✅ 已对齐上游全部属性

## 概览

| 指标 | 数值 |
| --- | --- |
| 上游属性 | 18 |
| 已对齐 | 13 |
| 覆盖率 | 72.2% |
| 深度债 | 0（D1 0 / D2 0 / D3 0） |
| Angular 惯用映射 | 5（插槽 / 双向绑定 / 事件名，不计债） |
| 未登记缺失 | 0 |
| 文档示例 | 11 个 |

## 组件明细

### `TButton`（`<t-button>`）

上游接口 `TdButtonProps`；上游属性 18、已对齐 13（72.2%）；深度债 0 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `variant` | ButtonVariant | 'base' | 按钮变体 |
| `theme` | ButtonTheme | 'default' | 按钮主题色 |
| `shape` | ButtonShape | 'rectangle' | 按钮形状 |
| `size` | ButtonSize | 'medium' | 按钮尺寸 |
| `block` | boolean | false | 是否撑满父容器宽度 |
| `ghost` | boolean | false | 是否为幽灵按钮 |
| `disabled` | boolean | false | 是否禁用 |
| `loading` | boolean | false | 是否处于加载状态 |
| `loadingProps` | LoadingOptions \| undefined | undefined | 加载组件配置，支持当前 LoadingOptions 中的属性，加载状态由 loading 决定 |
| `tag` | 'button' \| 'a' \| 'div' | 'button' | 渲染的标签，`a` 会渲染成链接 |
| `href` | string \| undefined | undefined | 链接地址，设置后自动以 `a` 渲染 |
| `type` | ButtonType | 'button' | 原生 button 的 type 属性 |
| `form` | string \| undefined | undefined | 关联的表单 id |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `content` | Angular 惯用映射 | Angular 用 <ng-content> 承载插槽内容，不是输入属性 |
| `default` | Angular 惯用映射 | 同 content，Vue 的默认插槽 |
| `icon` | Angular 惯用映射 | Angular 用 <t-icon tButtonIcon> 投影，不是输入属性 |
| `onClick` | Angular 惯用映射 | Angular 直接监听原生 click（会冒泡到宿主），不再额外提供输出，避免一次点击触发两次 |
| `suffix` | Angular 惯用映射 | Angular 用 <span tButtonSuffix> 投影，不是输入属性 |

## 文档示例

- `packages/docs/src/app/docs/button/demos/button-block.ts`
- `packages/docs/src/app/docs/button/demos/button-disabled.ts`
- `packages/docs/src/app/docs/button/demos/button-ghost.ts`
- `packages/docs/src/app/docs/button/demos/button-icon.ts`
- `packages/docs/src/app/docs/button/demos/button-link.ts`
- `packages/docs/src/app/docs/button/demos/button-loading-props.ts`
- `packages/docs/src/app/docs/button/demos/button-shape.ts`
- `packages/docs/src/app/docs/button/demos/button-size.ts`
- `packages/docs/src/app/docs/button/demos/button-theme-variant.ts`
- `packages/docs/src/app/docs/button/demos/button-theme.ts`
- `packages/docs/src/app/docs/button/demos/button-variant.ts`
