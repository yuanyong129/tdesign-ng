# 头像 Avatar · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/avatar/`
- 文档页：`/avatar`（`packages/docs/src/app/docs/avatar/avatar.component.ts`）
- 状态：✅ 已对齐上游全部属性

## 概览

| 指标 | 数值 |
| --- | --- |
| 上游属性 | 15 |
| 已对齐 | 12 |
| 覆盖率 | 80.0% |
| 深度债 | 0（D1 0 / D2 0 / D3 0） |
| Angular 惯用映射 | 3（插槽 / 双向绑定 / 事件名，不计债） |
| 未登记缺失 | 0 |
| 文档示例 | 5 个 |

## 组件明细

### `TAvatar`（`<t-avatar>`）

上游接口 `TdAvatarProps`；上游属性 10、已对齐 7（70.0%）；深度债 0 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `image` | string \| undefined | undefined | 图片地址 |
| `imageProps` | AvatarImageProps \| undefined | undefined | 图片配置，支持当前 AvatarImageProps 中的 Image 属性及回调，图片地址与 alt 以显式输入为准 |
| `alt` | string \| undefined | undefined | 图片的 alt 文本 |
| `shape` | AvatarShape | 'circle' | 头像形状 |
| `size` | string | 'medium' | 头像尺寸，支持 small / medium / large 或具体数值 |
| `hideOnLoadFailed` | boolean | false | 图片加载失败时是否隐藏图片并回退到头像内容 |
| `content` | AvatarContent | undefined | 头像内容，支持字符串或模板，无图片或隐藏失败图片时显示 |

**已实现事件**

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `error` | Event | 图片加载失败 |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `default` | Angular 惯用映射 | 内容通过 ng-content 与 content 输入提供 |
| `icon` | Angular 惯用映射 | Angular 用 <t-icon tAvatarIcon> 投影，不是输入属性 |
| `onError` | Angular 惯用映射 | Angular 用 (error) 输出 |

### `TAvatarGroup`（`<t-avatar-group>`）

上游接口 `TdAvatarGroupProps`；上游属性 5、已对齐 5（100.0%）；深度债 0 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `max` | number \| undefined | undefined | 最多显示的头像个数，正数时超出显示 +N，未设置或非正数时全部显示 |
| `cascading` | AvatarCascading | 'right-up' | 层叠方向 |
| `collapseAvatar` | AvatarContent | undefined | 折叠头像内容，支持字符串或模板，默认 +N |
| `popupProps` | PopupOptions \| undefined | undefined | 折叠头像列表的弹层配置，支持当前 PopupOptions |
| `size` | string \| undefined | undefined | 统一尺寸，会下发给组内所有头像 |

## 文档示例

- `packages/docs/src/app/docs/avatar/demos/avatar-basic.ts`
- `packages/docs/src/app/docs/avatar/demos/avatar-group-popup.ts`
- `packages/docs/src/app/docs/avatar/demos/avatar-group.ts`
- `packages/docs/src/app/docs/avatar/demos/avatar-image-props.ts`
- `packages/docs/src/app/docs/avatar/demos/avatar-shape.ts`
