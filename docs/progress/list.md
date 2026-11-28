# List 列表 · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/list/`
- 文档页：`/list`（`packages/docs/src/app/docs/list/list.component.ts`）
- 状态：🚧 有深度债 1 项

## 概览

| 指标 | 数值 |
| --- | --- |
| 上游属性 | 10 |
| 已对齐 | 7 |
| 覆盖率 | 70.0% |
| 深度债 | 1（D1 0 / D2 0 / D3 1） |
| Angular 惯用映射 | 2（插槽 / 双向绑定 / 事件名，不计债） |
| 未登记缺失 | 0 |
| 文档示例 | 4 个 |

## 组件明细

### `TList`（`<t-list>`）

上游接口 `TdListProps`；上游属性 10、已对齐 7（70.0%）；深度债 1 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `header` | string \| undefined | undefined | 列表头部内容 |
| `footer` | string \| undefined | undefined | 列表底部内容 |
| `layout` | ListLayout | 'horizontal' | 操作区排列方式，vertical 时操作区另起一行 |
| `size` | ListSize | 'medium' | 列表尺寸 |
| `split` | boolean | false | 是否显示分割线 |
| `stripe` | boolean | false | 是否显示斑马纹 |
| `asyncLoading` | string \| undefined | undefined | 异步加载状态，loading 显示加载图标，load-more 显示「加载更多」 |

**已实现事件**

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `loadMore` | ListLoadMoreEvent | 点击加载更多时触发 |
| `scrollChange` | ListScrollEvent | 列表滚动时触发 |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `onLoadMore` | Angular 惯用映射 | Angular 用 (loadMore) 输出 |
| `onScroll` | Angular 惯用映射 | Angular 用 (scrollChange) 输出，参数是 { originalEvent, scrollTop, scrollBottom } |
| `scroll` | D3 其余组件与边角能力 | 列表虚拟滚动在后续版本实现，当前用 height + 原生滚动；滚动位置用 (scrollChange) 读取 |

## 文档示例

- `packages/docs/src/app/docs/list/demos/list-action.ts`
- `packages/docs/src/app/docs/list/demos/list-async.ts`
- `packages/docs/src/app/docs/list/demos/list-basic.ts`
- `packages/docs/src/app/docs/list/demos/list-style.ts`
