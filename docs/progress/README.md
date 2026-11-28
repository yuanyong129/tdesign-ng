# 组件开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改。每个组件的明细见同目录 `<组件目录>.md`。

| 指标 | 数值 |
| --- | --- |
| 组件目录 | 73 |
| 上游属性 | 1576 |
| 已对齐 | 1086 |
| 覆盖率 | 68.9% |
| 深度债 | 188 项 |
| 零债务组件 | 51 / 73 |

状态图例：✅ 无债务；🚧 有深度债（D1 表格与选择线 / D2 录入与反馈 / D3 其余）；⚠️ 有未登记缺失。

## 按覆盖率排序

| 组件 | 目录 | 上游 | 已对齐 | 覆盖率 | D1 | D2 | D3 | 未登记 | 示例 | 状态 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| [Select 选择器](select.md) | `select` | 55 | 20 | 36.4% | 22 | 0 | 0 | 0 | 7 | 🚧 |
| [TimePicker 时间选择器](time-picker.md) | `time-picker` | 33 | 12 | 36.4% | 17 | 0 | 0 | 0 | 3 | 🚧 |
| [Cascader 级联组件](cascader.md) | `cascader` | 53 | 22 | 41.5% | 25 | 0 | 0 | 0 | 7 | 🚧 |
| [TreeSelect 树选择](tree-select.md) | `tree-select` | 44 | 20 | 45.5% | 16 | 0 | 0 | 0 | 6 | 🚧 |
| [DatePicker 日期选择器](date-picker.md) | `date-picker` | 44 | 22 | 50.0% | 19 | 0 | 0 | 0 | 11 | 🚧 |
| [DateRangePicker 日期范围](date-range-picker.md) | `date-range-picker` | 44 | 23 | 52.3% | 18 | 0 | 0 | 0 | 5 | 🚧 |
| [Input 输入框](input.md) | `input` | 46 | 26 | 56.5% | 0 | 0 | 0 | 0 | 10 | ✅ |
| [Upload 上传](upload.md) | `upload` | 63 | 36 | 57.1% | 0 | 7 | 3 | 0 | 3 | 🚧 |
| [Drawer 抽屉](drawer.md) | `drawer` | 31 | 18 | 58.1% | 0 | 8 | 0 | 0 | 3 | 🚧 |
| [Tree 树](tree.md) | `tree` | 50 | 30 | 60.0% | 10 | 8 | 1 | 0 | 3 | 🚧 |
| [Link 链接](link.md) | `link` | 13 | 8 | 61.5% | 0 | 0 | 0 | 0 | 6 | ✅ |
| [Transfer 穿梭框](transfer.md) | `transfer` | 26 | 16 | 61.5% | 4 | 4 | 2 | 0 | 3 | 🚧 |
| [Textarea 多行文本框](textarea.md) | `textarea` | 21 | 13 | 61.9% | 0 | 0 | 0 | 0 | 7 | ✅ |
| [Dialog 对话框](dialog.md) | `dialog` | 37 | 23 | 62.2% | 0 | 3 | 0 | 0 | 5 | 🚧 |
| [Message 全局提示](message.md) | `message` | 8 | 5 | 62.5% | 0 | 0 | 0 | 0 | 5 | ✅ |
| [Notification 消息通知](notification.md) | `notification` | 11 | 7 | 63.6% | 0 | 0 | 0 | 0 | 5 | ✅ |
| [AutoComplete 自动填充](auto-complete.md) | `auto-complete` | 32 | 21 | 65.6% | 1 | 0 | 0 | 0 | 4 | 🚧 |
| [Divider 分割线](divider.md) | `divider` | 6 | 4 | 66.7% | 0 | 0 | 0 | 0 | 4 | ✅ |
| [Layout 布局](layout.md) | `layout` | 6 | 4 | 66.7% | 0 | 0 | 0 | 0 | 3 | ✅ |
| [TagInput 标签输入框](tag-input.md) | `tag-input` | 39 | 26 | 66.7% | 0 | 0 | 1 | 0 | 4 | 🚧 |
| [RangeInput 范围输入框](range-input.md) | `range-input` | 28 | 19 | 67.9% | 0 | 0 | 2 | 0 | 4 | 🚧 |
| [Tabs 选项卡](tabs.md) | `tabs` | 16 | 11 | 68.8% | 0 | 0 | 0 | 0 | 8 | ✅ |
| [CheckTag 可选标签](check-tag.md) | `check-tag` | 20 | 14 | 70.0% | 0 | 0 | 1 | 0 | 4 | 🚧 |
| [List 列表](list.md) | `list` | 10 | 7 | 70.0% | 0 | 0 | 1 | 0 | 4 | 🚧 |
| [Menu 导航菜单](menu.md) | `menu` | 34 | 24 | 70.6% | 0 | 4 | 0 | 0 | 4 | 🚧 |
| [Checkbox 多选框](checkbox.md) | `checkbox` | 24 | 17 | 70.8% | 0 | 0 | 2 | 0 | 7 | 🚧 |
| [InputNumber 数字输入框](input-number.md) | `input-number` | 31 | 22 | 71.0% | 0 | 0 | 0 | 0 | 4 | ✅ |
| [Affix 固钉](affix.md) | `affix` | 7 | 5 | 71.4% | 0 | 0 | 0 | 0 | 3 | ✅ |
| [Guide 引导](guide.md) | `guide` | 21 | 15 | 71.4% | 0 | 0 | 0 | 0 | 3 | ✅ |
| [Skeleton 骨架屏](skeleton.md) | `skeleton` | 7 | 5 | 71.4% | 0 | 0 | 0 | 0 | 3 | ✅ |
| [Tag 标签](tag.md) | `tag` | 14 | 10 | 71.4% | 0 | 0 | 0 | 0 | 5 | ✅ |
| [SelectInput 筛选器输入框](select-input.md) | `select-input` | 43 | 31 | 72.1% | 0 | 0 | 0 | 0 | 4 | ✅ |
| [Button 按钮](button.md) | `button` | 18 | 13 | 72.2% | 0 | 0 | 0 | 0 | 11 | ✅ |
| [Table 表格](table.md) | `table` | 62 | 45 | 72.6% | 1 | 1 | 0 | 0 | 23 | 🚧 |
| [Alert 警告提醒](alert.md) | `alert` | 11 | 8 | 72.7% | 0 | 0 | 0 | 0 | 3 | ✅ |
| [Breadcrumb 面包屑](breadcrumb.md) | `breadcrumb` | 19 | 14 | 73.7% | 0 | 0 | 3 | 0 | 4 | 🚧 |
| [ImageViewer 图片预览](image-viewer.md) | `image-viewer` | 23 | 17 | 73.9% | 0 | 1 | 1 | 0 | 3 | 🚧 |
| [Popconfirm 气泡确认框](popconfirm.md) | `popconfirm` | 16 | 12 | 75.0% | 0 | 0 | 0 | 0 | 4 | ✅ |
| [Popup 弹出层](popup.md) | `popup` | 24 | 18 | 75.0% | 0 | 0 | 0 | 0 | 8 | ✅ |
| [Radio 单选框](radio.md) | `radio` | 25 | 19 | 76.0% | 0 | 0 | 0 | 0 | 8 | ✅ |
| [Calendar 日历](calendar.md) | `calendar` | 22 | 17 | 77.3% | 0 | 0 | 0 | 0 | 3 | ✅ |
| [StickyTool 侧边栏](sticky-tool.md) | `sticky-tool` | 9 | 7 | 77.8% | 0 | 0 | 0 | 0 | 4 | ✅ |
| [Avatar 头像](avatar.md) | `avatar` | 15 | 12 | 80.0% | 0 | 0 | 0 | 0 | 5 | ✅ |
| [Switch 开关](switch.md) | `switch` | 10 | 8 | 80.0% | 0 | 0 | 0 | 0 | 6 | ✅ |
| [Slider 滑块](slider.md) | `slider` | 16 | 13 | 81.3% | 0 | 0 | 0 | 0 | 5 | ✅ |
| [BackTop 回到顶部](back-top.md) | `back-top` | 11 | 9 | 81.8% | 0 | 0 | 0 | 0 | 3 | ✅ |
| [Collapse 折叠面板](collapse.md) | `collapse` | 11 | 9 | 81.8% | 0 | 0 | 0 | 0 | 3 | ✅ |
| [ColorPicker 颜色选择器](color-picker.md) | `color-picker` | 22 | 18 | 81.8% | 0 | 0 | 0 | 0 | 3 | ✅ |
| [Steps 步骤条](steps.md) | `steps` | 17 | 14 | 82.4% | 0 | 0 | 0 | 0 | 4 | ✅ |
| [Pagination 分页](pagination.md) | `pagination` | 23 | 19 | 82.6% | 0 | 0 | 0 | 0 | 6 | ✅ |
| [Anchor 锚点](anchor.md) | `anchor` | 12 | 10 | 83.3% | 0 | 0 | 0 | 0 | 3 | ✅ |
| [Typography 排版](typography.md) | `typography` | 20 | 17 | 85.0% | 0 | 0 | 0 | 0 | 5 | ✅ |
| [Empty 空状态](empty.md) | `empty` | 7 | 6 | 85.7% | 0 | 0 | 0 | 0 | 4 | ✅ |
| [Rate 评分](rate.md) | `rate` | 14 | 12 | 85.7% | 0 | 0 | 0 | 0 | 5 | ✅ |
| [Form 表单](form.md) | `form` | 34 | 30 | 88.2% | 0 | 0 | 0 | 0 | 8 | ✅ |
| [Grid 栅格](grid.md) | `grid` | 17 | 15 | 88.2% | 0 | 0 | 2 | 0 | 4 | 🚧 |
| [Image 图片](image.md) | `image` | 17 | 15 | 88.2% | 0 | 0 | 0 | 0 | 3 | ✅ |
| [Badge 徽标](badge.md) | `badge` | 10 | 9 | 90.0% | 0 | 0 | 0 | 0 | 2 | ✅ |
| [Dropdown 下拉菜单](dropdown.md) | `dropdown` | 21 | 19 | 90.5% | 0 | 0 | 0 | 0 | 3 | ✅ |
| [QRCode 二维码](qrcode.md) | `qrcode` | 12 | 11 | 91.7% | 0 | 0 | 0 | 0 | 3 | ✅ |
| [Timeline 时间轴](timeline.md) | `timeline` | 12 | 11 | 91.7% | 0 | 0 | 0 | 0 | 3 | ✅ |
| [Card 卡片](card.md) | `card` | 25 | 23 | 92.0% | 0 | 0 | 0 | 0 | 5 | ✅ |
| [Loading 加载](loading.md) | `loading` | 13 | 12 | 92.3% | 0 | 0 | 0 | 0 | 3 | ✅ |
| [Descriptions 描述](descriptions.md) | `descriptions` | 15 | 14 | 93.3% | 0 | 0 | 0 | 0 | 4 | ✅ |
| [Swiper 轮播框](swiper.md) | `swiper` | 15 | 14 | 93.3% | 0 | 0 | 0 | 0 | 3 | ✅ |
| [Watermark 水印](watermark.md) | `watermark` | 17 | 16 | 94.1% | 0 | 0 | 0 | 0 | 3 | ✅ |
| [Comment 评论](comment.md) | `comment` | 7 | 7 | 100.0% | 0 | 0 | 0 | 0 | 3 | ✅ |
| [全局特性配置](config-provider.md) | `config-provider` | 1 | 1 | 100.0% | 0 | 0 | 0 | 0 | 1 | ✅ |
| [InputAdornment 输入装饰器](input-adornment.md) | `input-adornment` | 2 | 2 | 100.0% | 0 | 0 | 0 | 0 | 2 | ✅ |
| [Progress 进度条](progress.md) | `progress` | 8 | 8 | 100.0% | 0 | 0 | 0 | 0 | 5 | ✅ |
| [Space 间距](space.md) | `space` | 5 | 5 | 100.0% | 0 | 0 | 0 | 0 | 6 | ✅ |
| [Statistic 统计数值](statistic.md) | `statistic` | 15 | 15 | 100.0% | 0 | 0 | 0 | 0 | 4 | ✅ |
| [Tooltip 文字提示](tooltip.md) | `tooltip` | 6 | 6 | 100.0% | 0 | 0 | 0 | 0 | 4 | ✅ |

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
