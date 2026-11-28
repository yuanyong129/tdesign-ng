# Swiper 轮播框 · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/swiper/`
- 文档页：`/swiper`（`packages/docs/src/app/docs/swiper/swiper.component.ts`）
- 状态：✅ 已对齐上游全部属性

## 概览

| 指标 | 数值 |
| --- | --- |
| 上游属性 | 15 |
| 已对齐 | 14 |
| 覆盖率 | 93.3% |
| 深度债 | 0（D1 0 / D2 0 / D3 0） |
| Angular 惯用映射 | 1（插槽 / 双向绑定 / 事件名，不计债） |
| 未登记缺失 | 0 |
| 文档示例 | 3 个 |

## 组件明细

### `TSwiper`（`<t-swiper>`）

上游接口 `TdSwiperProps`；上游属性 15、已对齐 14（93.3%）；深度债 0 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `animation` | SwiperAnimation | slide | 切换动画 |
| `autoplay` | boolean | true | 自动播放 |
| `cardScale` | number | 0.6325301204819277 | 卡片缩放比例 |
| `current` | number \| undefined | undefined | 当前索引 |
| `defaultCurrent` | number | 0 | 默认索引 |
| `direction` | SwiperDirection | horizontal | 轮播方向 |
| `duration` | number | 300 | 动画时长 |
| `height` | number \| undefined | undefined | 轮播高度 |
| `interval` | number | 5000 | 播放间隔 |
| `loop` | boolean | true | 循环播放 |
| `navigation` | SwiperNavigation \| TemplateRef<unknown> \| undefined | undefined | 导航器配置 |
| `stopOnHover` | boolean | true | 悬浮暂停 |
| `trigger` | SwiperTrigger | hover | 导航触发方式 |
| `type` | SwiperType | default | 轮播类型 |

**已实现事件**

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `change` | SwiperChangeEvent | 切换事件 |
| `currentChange` | number | 索引变化 |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `onChange` | Angular 惯用映射 | Angular 用 (change) 输出，参数 { current, source } |

## 文档示例

- `packages/docs/src/app/docs/swiper/demos/swiper-autoplay.ts`
- `packages/docs/src/app/docs/swiper/demos/swiper-base.ts`
- `packages/docs/src/app/docs/swiper/demos/swiper-navigation.ts`
