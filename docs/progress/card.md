# 卡片 Card · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/card/`
- 文档页：`/card`（`packages/docs/src/app/docs/card/card.component.ts`）
- 状态：✅ 已对齐上游全部属性

## 概览

| 指标 | 数值 |
| --- | --- |
| 上游属性 | 25 |
| 已对齐 | 23 |
| 覆盖率 | 92.0% |
| 深度债 | 0（D1 0 / D2 0 / D3 0） |
| Angular 惯用映射 | 2（插槽 / 双向绑定 / 事件名，不计债） |
| 未登记缺失 | 0 |
| 文档示例 | 4 个 |

## 组件明细

### `TCard`（`<t-card>`）

上游接口 `TdCardProps`；上游属性 25、已对齐 23（92.0%）；深度债 0 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `actions` | CardContent | undefined | 卡片操作区 |
| `avatar` | CardContent | undefined | 卡片头像 |
| `bordered` | boolean | false | 是否显示卡片边框 |
| `bodyClassName` | string \| undefined | undefined | 卡片主体区域的类名 |
| `bodyStyle` | CardStyles | undefined | 卡片主体区域的样式 |
| `cover` | CardContent | undefined | 卡片封面 |
| `description` | CardContent | undefined | 卡片描述 |
| `footer` | CardContent | undefined | 卡片底部内容 |
| `footerClassName` | string \| undefined | undefined | 卡片底部区域的类名 |
| `footerStyle` | CardStyles | undefined | 卡片底部区域的样式 |
| `header` | CardContent | undefined | 自定义卡片头部 |
| `headerClassName` | string \| undefined | undefined | 卡片头部区域的类名 |
| `headerStyle` | CardStyles | undefined | 卡片头部区域的样式 |
| `headerBordered` | boolean | false | 卡片头部是否显示下边框 |
| `hoverShadow` | boolean | false | 鼠标悬浮时是否显示阴影 |
| `loading` | boolean | false | 是否显示加载态 |
| `loadingProps` | LoadingOptions \| undefined | undefined | 加载组件配置，支持当前 LoadingOptions 中的属性，加载状态由 loading 决定 |
| `shadow` | boolean | false | 是否显示卡片阴影 |
| `size` | CardSize | 'medium' | 卡片尺寸 |
| `status` | string \| undefined | undefined | 卡片状态 |
| `subtitle` | CardContent | undefined | 卡片副标题 |
| `theme` | CardTheme | 'normal' | 卡片主题 |
| `title` | CardContent | undefined | 卡片标题 |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `content` | Angular 惯用映射 | Angular 用 <ng-content> 承载卡片主体内容 |
| `default` | Angular 惯用映射 | 同 content，Vue 的默认插槽 |

## 文档示例

- `packages/docs/src/app/docs/card/demos/card-basic.ts`
- `packages/docs/src/app/docs/card/demos/card-cover.ts`
- `packages/docs/src/app/docs/card/demos/card-loading-props.ts`
- `packages/docs/src/app/docs/card/demos/card-loading.ts`
