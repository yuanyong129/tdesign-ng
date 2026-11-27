# 组件开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改。每个组件的明细见同目录 `<组件目录>.md`。

| 指标 | 数值 |
| --- | --- |
| 组件目录 | 73 |
| 上游属性 | 1576 |
| 已对齐 | 1063 |
| 覆盖率 | 67.4% |
| 深度债 | 222 项 |
| 零债务组件 | 42 / 73 |

状态图例：✅ 无债务；🚧 有深度债（D1 表格与选择线 / D2 录入与反馈 / D3 其余）；⚠️ 有未登记缺失。

## 按覆盖率排序

| 组件 | 目录 | 上游 | 已对齐 | 覆盖率 | D1 | D2 | D3 | 未登记 | 示例 | 状态 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [选择器 Select](select.md) | `select` | 55 | 20 | 36.4% | 22 | 0 | 0 | 0 | 7 | 🚧 |
| [时间选择 TimePicker](time-picker.md) | `time-picker` | 33 | 12 | 36.4% | 17 | 0 | 0 | 0 | 3 | 🚧 |
| [级联选择 Cascader](cascader.md) | `cascader` | 53 | 22 | 41.5% | 25 | 0 | 0 | 0 | 7 | 🚧 |
| [树选择 TreeSelect](tree-select.md) | `tree-select` | 44 | 20 | 45.5% | 16 | 0 | 0 | 0 | 6 | 🚧 |
| [日期选择 DatePicker](date-picker.md) | `date-picker` | 44 | 22 | 50.0% | 19 | 0 | 0 | 0 | 11 | 🚧 |
| [弹出层 Popup](popup.md) | `popup` | 24 | 12 | 50.0% | 0 | 7 | 0 | 0 | 5 | 🚧 |
| [日期范围 DateRangePicker](date-range-picker.md) | `date-range-picker` | 44 | 23 | 52.3% | 18 | 0 | 0 | 0 | 5 | 🚧 |
| [面包屑 Breadcrumb](breadcrumb.md) | `breadcrumb` | 19 | 10 | 52.6% | 0 | 0 | 7 | 0 | 3 | 🚧 |
| [输入框 Input](input.md) | `input` | 46 | 26 | 56.5% | 0 | 0 | 0 | 0 | 10 | ✅ |
| [上传 Upload](upload.md) | `upload` | 63 | 36 | 57.1% | 0 | 7 | 3 | 0 | 3 | 🚧 |
| [抽屉 Drawer](drawer.md) | `drawer` | 31 | 18 | 58.1% | 0 | 8 | 0 | 0 | 3 | 🚧 |
| [自动补全 AutoComplete](auto-complete.md) | `auto-complete` | 32 | 19 | 59.4% | 1 | 2 | 0 | 0 | 3 | 🚧 |
| [对话框 Dialog](dialog.md) | `dialog` | 37 | 22 | 59.5% | 0 | 10 | 0 | 0 | 4 | 🚧 |
| [树形控件 Tree](tree.md) | `tree` | 50 | 30 | 60.0% | 10 | 8 | 1 | 0 | 3 | 🚧 |
| [链接 Link](link.md) | `link` | 13 | 8 | 61.5% | 0 | 0 | 0 | 0 | 6 | ✅ |
| [穿梭框 Transfer](transfer.md) | `transfer` | 26 | 16 | 61.5% | 4 | 4 | 2 | 0 | 3 | 🚧 |
| [文本域 Textarea](textarea.md) | `textarea` | 21 | 13 | 61.9% | 0 | 0 | 0 | 0 | 7 | ✅ |
| [全局提示 Message](message.md) | `message` | 8 | 5 | 62.5% | 0 | 0 | 1 | 0 | 3 | 🚧 |
| [选项卡 Tabs](tabs.md) | `tabs` | 16 | 10 | 62.5% | 0 | 0 | 1 | 0 | 7 | 🚧 |
| [通知 Notification](notification.md) | `notification` | 11 | 7 | 63.6% | 0 | 0 | 1 | 0 | 3 | 🚧 |
| [分割线 Divider](divider.md) | `divider` | 6 | 4 | 66.7% | 0 | 0 | 0 | 0 | 4 | ✅ |
| [布局 Layout](layout.md) | `layout` | 6 | 4 | 66.7% | 0 | 0 | 0 | 0 | 3 | ✅ |
| [标签输入框 TagInput](tag-input.md) | `tag-input` | 39 | 26 | 66.7% | 0 | 0 | 1 | 0 | 4 | 🚧 |
| [选择器输入 SelectInput](select-input.md) | `select-input` | 43 | 29 | 67.4% | 0 | 2 | 2 | 0 | 3 | 🚧 |
| [范围输入框 RangeInput](range-input.md) | `range-input` | 28 | 19 | 67.9% | 0 | 0 | 2 | 0 | 4 | 🚧 |
| [加载 Loading](loading.md) | `loading` | 13 | 9 | 69.2% | 0 | 0 | 3 | 0 | 2 | 🚧 |
| [可选标签 CheckTag](check-tag.md) | `check-tag` | 20 | 14 | 70.0% | 0 | 0 | 1 | 0 | 4 | 🚧 |
| [列表 List](list.md) | `list` | 10 | 7 | 70.0% | 0 | 0 | 1 | 0 | 4 | 🚧 |
| [导航菜单 Menu](menu.md) | `menu` | 34 | 24 | 70.6% | 0 | 4 | 0 | 0 | 4 | 🚧 |
| [多选框 Checkbox](checkbox.md) | `checkbox` | 24 | 17 | 70.8% | 0 | 0 | 2 | 0 | 7 | 🚧 |
| [数字输入框 InputNumber](input-number.md) | `input-number` | 31 | 22 | 71.0% | 0 | 0 | 0 | 0 | 4 | ✅ |
| [固钉 Affix](affix.md) | `affix` | 7 | 5 | 71.4% | 0 | 0 | 0 | 0 | 3 | ✅ |
| [引导 Guide](guide.md) | `guide` | 21 | 15 | 71.4% | 0 | 0 | 0 | 0 | 3 | ✅ |
| [骨架屏 Skeleton](skeleton.md) | `skeleton` | 7 | 5 | 71.4% | 0 | 0 | 0 | 0 | 3 | ✅ |
| [标签 Tag](tag.md) | `tag` | 14 | 10 | 71.4% | 0 | 0 | 0 | 0 | 5 | ✅ |
| [按钮 Button](button.md) | `button` | 18 | 13 | 72.2% | 0 | 0 | 0 | 0 | 11 | ✅ |
| [表格 Table](table.md) | `table` | 62 | 45 | 72.6% | 1 | 1 | 0 | 0 | 23 | 🚧 |
| [警告提示 Alert](alert.md) | `alert` | 11 | 8 | 72.7% | 0 | 0 | 0 | 0 | 3 | ✅ |
| [图片预览 ImageViewer](image-viewer.md) | `image-viewer` | 23 | 17 | 73.9% | 0 | 1 | 1 | 0 | 3 | 🚧 |
| [气泡确认 Popconfirm](popconfirm.md) | `popconfirm` | 16 | 12 | 75.0% | 0 | 0 | 0 | 0 | 4 | ✅ |
| [单选框 Radio](radio.md) | `radio` | 25 | 19 | 76.0% | 0 | 0 | 0 | 0 | 8 | ✅ |
| [步骤条 Steps](steps.md) | `steps` | 17 | 13 | 76.5% | 0 | 0 | 1 | 0 | 3 | 🚧 |
| [日历 Calendar](calendar.md) | `calendar` | 22 | 17 | 77.3% | 0 | 0 | 0 | 0 | 3 | ✅ |
| [侧边悬浮 StickyTool](sticky-tool.md) | `sticky-tool` | 9 | 7 | 77.8% | 0 | 0 | 0 | 0 | 4 | ✅ |
| [头像 Avatar](avatar.md) | `avatar` | 15 | 12 | 80.0% | 0 | 0 | 0 | 0 | 5 | ✅ |
| [开关 Switch](switch.md) | `switch` | 10 | 8 | 80.0% | 0 | 0 | 0 | 0 | 6 | ✅ |
| [滑块 Slider](slider.md) | `slider` | 16 | 13 | 81.3% | 0 | 0 | 0 | 0 | 5 | ✅ |
| [回到顶部 BackTop](back-top.md) | `back-top` | 11 | 9 | 81.8% | 0 | 0 | 0 | 0 | 3 | ✅ |
| [折叠面板 Collapse](collapse.md) | `collapse` | 11 | 9 | 81.8% | 0 | 0 | 0 | 0 | 3 | ✅ |
| [颜色选择器 ColorPicker](color-picker.md) | `color-picker` | 22 | 18 | 81.8% | 0 | 0 | 0 | 0 | 3 | ✅ |
| [分页 Pagination](pagination.md) | `pagination` | 23 | 19 | 82.6% | 0 | 0 | 0 | 0 | 6 | ✅ |
| [锚点 Anchor](anchor.md) | `anchor` | 12 | 10 | 83.3% | 0 | 0 | 0 | 0 | 3 | ✅ |
| [排版 Typography](typography.md) | `typography` | 20 | 17 | 85.0% | 0 | 0 | 0 | 0 | 5 | ✅ |
| [表单 Form](form.md) | `form` | 34 | 29 | 85.3% | 0 | 1 | 0 | 0 | 7 | 🚧 |
| [空状态 Empty](empty.md) | `empty` | 7 | 6 | 85.7% | 0 | 0 | 0 | 0 | 4 | ✅ |
| [评分 Rate](rate.md) | `rate` | 14 | 12 | 85.7% | 0 | 0 | 0 | 0 | 5 | ✅ |
| [统计数值 Statistic](statistic.md) | `statistic` | 15 | 13 | 86.7% | 0 | 0 | 2 | 0 | 3 | 🚧 |
| [栅格 Grid](grid.md) | `grid` | 17 | 15 | 88.2% | 0 | 0 | 2 | 0 | 4 | 🚧 |
| [图片 Image](image.md) | `image` | 17 | 15 | 88.2% | 0 | 0 | 0 | 0 | 3 | ✅ |
| [徽标 Badge](badge.md) | `badge` | 10 | 9 | 90.0% | 0 | 0 | 0 | 0 | 2 | ✅ |
| [下拉菜单 Dropdown](dropdown.md) | `dropdown` | 21 | 19 | 90.5% | 0 | 0 | 0 | 0 | 3 | ✅ |
| [二维码 QRCode](qrcode.md) | `qrcode` | 12 | 11 | 91.7% | 0 | 0 | 0 | 0 | 3 | ✅ |
| [时间轴 Timeline](timeline.md) | `timeline` | 12 | 11 | 91.7% | 0 | 0 | 0 | 0 | 3 | ✅ |
| [卡片 Card](card.md) | `card` | 25 | 23 | 92.0% | 0 | 0 | 0 | 0 | 4 | ✅ |
| [描述列表 Descriptions](descriptions.md) | `descriptions` | 15 | 14 | 93.3% | 0 | 0 | 0 | 0 | 4 | ✅ |
| [轮播 Swiper](swiper.md) | `swiper` | 15 | 14 | 93.3% | 0 | 0 | 0 | 0 | 3 | ✅ |
| [水印 Watermark](watermark.md) | `watermark` | 17 | 16 | 94.1% | 0 | 0 | 0 | 0 | 3 | ✅ |
| [评论 Comment](comment.md) | `comment` | 7 | 7 | 100.0% | 0 | 0 | 0 | 0 | 3 | ✅ |
| [全局配置 ConfigProvider](config-provider.md) | `config-provider` | 1 | 1 | 100.0% | 0 | 0 | 0 | 0 | 1 | ✅ |
| [前后缀 InputAdornment](input-adornment.md) | `input-adornment` | 2 | 2 | 100.0% | 0 | 0 | 0 | 0 | 2 | ✅ |
| [进度条 Progress](progress.md) | `progress` | 8 | 8 | 100.0% | 0 | 0 | 0 | 0 | 5 | ✅ |
| [间距 Space](space.md) | `space` | 5 | 5 | 100.0% | 0 | 0 | 0 | 0 | 6 | ✅ |
| [文字提示 Tooltip](tooltip.md) | `tooltip` | 6 | 6 | 100.0% | 0 | 0 | 0 | 0 | 4 | ✅ |

## 无上游对照

这些类在 `align-check.config` 里声明了 `upstream: null`，不参与覆盖率统计。

| 类 | 说明 |
| --- | --- |
| `TButtonGroup` | TDesign 没有 button-group 组件，用 space + variant 组合替代 |
| `TScrollbar` | TDesign 没有 scrollbar 组件，属于 Arco 独有能力，P1 移除 |
| `TThumb` | 内部实现组件，不对外 |

## 怎么更新

```bash
pnpm gen:progress     # 按当前源码与 align-check 重新生成
pnpm check:progress   # 校验入库版本是否最新（integrator 跑）
```

债务分类来自 `scripts/align-check.config/<TXxx>.mjs` 的 `ignoreUpstream` 原因前缀；`pnpm depth:report` 会给出同一套口径的汇总。
