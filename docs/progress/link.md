# 链接 Link · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/link/`
- 文档页：`/link`（`packages/docs/src/app/docs/link/link.component.ts`）
- 状态：✅ 已对齐上游全部属性

## 概览

| 指标 | 数值 |
| --- | --- |
| 上游属性 | 13 |
| 已对齐 | 8 |
| 覆盖率 | 61.5% |
| 深度债 | 0（D1 0 / D2 0 / D3 0） |
| Angular 惯用映射 | 5（插槽 / 双向绑定 / 事件名，不计债） |
| 未登记缺失 | 0 |
| 文档示例 | 6 个 |

## 组件明细

### `TLink`（`<t-link>`）

上游接口 `TdLinkProps`；上游属性 13、已对齐 8（61.5%）；深度债 0 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `href` | string \| undefined | undefined | 链接地址 |
| `target` | string \| undefined | undefined | 跳转目标 |
| `theme` | LinkTheme | default | 主题色 |
| `size` | LinkSize | medium | 尺寸 |
| `underline` | boolean | false | 是否显示下划线 |
| `hover` | LinkHover | underline | 悬浮态效果 |
| `disabled` | boolean | false | 是否禁用 |
| `download` | string \| boolean \| undefined | undefined | 下载 |
| `hasPrefixIcon` | boolean | false | 是否带前缀图标 |
| `hasSuffixIcon` | boolean | false | 是否带后缀图标 |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `content` | Angular 惯用映射 | Angular 用 <ng-content> 承载链接文字 |
| `default` | Angular 惯用映射 | 同 content，Vue 的默认插槽 |
| `onClick` | Angular 惯用映射 | Angular 直接监听原生 click（会冒泡到宿主），不再额外提供输出，避免一次点击触发两次 |
| `prefixIcon` | Angular 惯用映射 | Angular 用 <t-icon tLinkPrefixIcon> 投影，配合 [hasPrefixIcon] 留出间距 |
| `suffixIcon` | Angular 惯用映射 | Angular 用 <t-icon tLinkSuffixIcon> 投影，配合 [hasSuffixIcon] 留出间距 |

## 文档示例

- `packages/docs/src/app/docs/link/demos/link-base.ts`
- `packages/docs/src/app/docs/link/demos/link-disabled.ts`
- `packages/docs/src/app/docs/link/demos/link-download.ts`
- `packages/docs/src/app/docs/link/demos/link-icon.ts`
- `packages/docs/src/app/docs/link/demos/link-size.ts`
- `packages/docs/src/app/docs/link/demos/link-underline.ts`
