# 面包屑 Breadcrumb · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/breadcrumb/`
- 文档页：`/breadcrumb`（`packages/docs/src/app/docs/breadcrumb/breadcrumb.component.ts`）
- 状态：🚧 有深度债 7 项

## 概览

| 指标 | 数值 |
| --- | --- |
| 上游属性 | 19 |
| 已对齐 | 10 |
| 覆盖率 | 52.6% |
| 深度债 | 7（D1 0 / D2 0 / D3 7） |
| Angular 惯用映射 | 2（插槽 / 双向绑定 / 事件名，不计债） |
| 未登记缺失 | 0 |
| 文档示例 | 3 个 |

## 组件明细

### `TBreadcrumb`（`<t-breadcrumb>`）

上游接口 `TdBreadcrumbProps`；上游属性 8、已对齐 4（50.0%）；深度债 4 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `maxItemWidth` | string \| undefined | undefined | 最大宽度 |
| `options` | BreadcrumbOption[] \| undefined | undefined | 选项列表 |
| `separator` | BreadcrumbContent | undefined | 分隔符 |
| `theme` | BreadcrumbTheme | light | 主题 |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `ellipsis` | D3 其余组件与边角能力 | [D3] 折叠省略号需要 Popup/Tooltip 门户与溢出测量，本库暂无折叠容器 |
| `itemsAfterCollapse` | D3 其余组件与边角能力 | [D3] 折叠算法参数 |
| `itemsBeforeCollapse` | D3 其余组件与边角能力 | [D3] 折叠算法参数 |
| `maxItems` | D3 其余组件与边角能力 | [D3] 与 ellipsis 配套的折叠阈值 |

### `TBreadcrumbItem`（`<t-breadcrumb-item>`）

上游接口 `TdBreadcrumbItemProps`；上游属性 11、已对齐 6（54.5%）；深度债 3 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `content` | BreadcrumbContent | undefined | 面包屑内容 |
| `disabled` | boolean | false | 是否禁用 |
| `href` | string \| undefined | undefined | 跳转链接 |
| `icon` | BreadcrumbContent | undefined | 前缀图标 |
| `maxWidth` | string \| undefined | undefined | 最大宽度 |
| `target` | BreadcrumbTarget \| undefined | undefined | 链接打开位置 |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `default` | Angular 惯用映射 | Angular 用 <ng-content> 承载面包屑文字 |
| `onClick` | Angular 惯用映射 | Angular 用原生 (click)；options 数据驱动项暂不提供回调 |
| `replace` | D3 其余组件与边角能力 | [D3] Vue Router 历史替换语义，Angular 用 routerLink 的 replaceUrl |
| `router` | D3 其余组件与边角能力 | [D3] Vue Router 实例注入位，Angular 用 Router DI |
| `to` | D3 其余组件与边角能力 | [D3] Vue Router 的 Route 对象语义，Angular 用 href 或上层 routerLink |

## 文档示例

- `packages/docs/src/app/docs/breadcrumb/demos/breadcrumb-base.ts`
- `packages/docs/src/app/docs/breadcrumb/demos/breadcrumb-options.ts`
- `packages/docs/src/app/docs/breadcrumb/demos/breadcrumb-separator.ts`
