# 头像 Avatar · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/avatar/`
- 文档页：`/avatar`（`packages/docs/src/app/docs/avatar/avatar.component.ts`）
- 状态：🚧 有深度债 2 项

## 概览

| 指标 | 数值 |
| --- | --- |
| 上游属性 | 15 |
| 已对齐 | 10 |
| 覆盖率 | 66.7% |
| 深度债 | 2（D1 0 / D2 0 / D3 2） |
| Angular 惯用映射 | 3（插槽 / 双向绑定 / 事件名，不计债） |
| 未登记缺失 | 0 |
| 文档示例 | 3 个 |

## 组件明细

### `TAvatar`（`<t-avatar>`）

上游接口 `TdAvatarProps`；上游属性 10、已对齐 6（60.0%）；深度债 1 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `image` | string \| undefined | undefined | 图片地址 |
| `alt` | string \| undefined | undefined | 图片的 alt 文本 |
| `shape` | AvatarShape | 'circle' | 头像形状 |
| `size` | string | 'medium' | 头像尺寸，支持 small / medium / large 或具体数值 |
| `hideOnLoadFailed` | boolean | false | 图片加载失败时是否隐藏 |
| `content` | string \| undefined | undefined | 头像文字，图片不可用时作为降级内容 |

**已实现事件**

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `error` | Event | 图片加载失败 |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `default` | Angular 惯用映射 | 内容通过 ng-content 与 content 输入提供 |
| `icon` | Angular 惯用映射 | Angular 用 <t-icon tAvatarIcon> 投影，不是输入属性 |
| `imageProps` | D3 其余组件与边角能力 | 内部用原生 img，暂不透传 Image 组件属性 |
| `onError` | Angular 惯用映射 | Angular 用 (error) 输出 |

### `TAvatarGroup`（`<t-avatar-group>`）

上游接口 `TdAvatarGroupProps`；上游属性 5、已对齐 4（80.0%）；深度债 1 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `max` | number \| undefined | undefined | 最多显示的头像个数，超出显示 +N |
| `cascading` | AvatarCascading | 'right-up' | 层叠方向 |
| `collapseAvatar` | string \| undefined | undefined | 折叠头像的文字，默认 +N |
| `size` | string \| undefined | undefined | 统一尺寸，会下发给组内所有头像 |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `popupProps` | D3 其余组件与边角能力 | 折叠头像的弹层列表尚未实现，只显示 +N |

## 文档示例

- `packages/docs/src/app/docs/avatar/demos/avatar-basic.ts`
- `packages/docs/src/app/docs/avatar/demos/avatar-group.ts`
- `packages/docs/src/app/docs/avatar/demos/avatar-shape.ts`
