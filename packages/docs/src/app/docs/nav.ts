/**
 * 文档站导航的单一数据源：侧边栏、上一页/下一页都从这里读，
 * 新增组件页时只要加一项，不会出现三处不同步。
 */
export interface DocsNavItem {
  /** 路由路径，带前导斜杠。 */
  path: string;
  /** 侧边栏显示名。 */
  label: string;
  /** 分组标题，同一分组的相邻项在侧边栏里归在一起。 */
  group: string;
}

// 分组与顺序对齐 https://tdesign.tencent.com/vue-next/overview（2026-11-28）。
// 独立的 DateRangePicker / CheckTag 页面紧随主组件；全局特性配置与官方一样置于组件之前。
export const DOCS_NAV: DocsNavItem[] = [
  { path: '/config-provider', label: '全局特性配置', group: '全局配置' },
  { path: '/button', label: 'Button 按钮', group: '基础' },
  { path: '/link', label: 'Link 链接', group: '基础' },
  { path: '/typography', label: 'Typography 排版', group: '基础' },
  { path: '/divider', label: 'Divider 分割线', group: '布局' },
  { path: '/grid', label: 'Grid 栅格', group: '布局' },
  { path: '/layout', label: 'Layout 布局', group: '布局' },
  { path: '/space', label: 'Space 间距', group: '布局' },
  { path: '/affix', label: 'Affix 固钉', group: '导航' },
  { path: '/anchor', label: 'Anchor 锚点', group: '导航' },
  { path: '/back-top', label: 'BackTop 回到顶部', group: '导航' },
  { path: '/breadcrumb', label: 'Breadcrumb 面包屑', group: '导航' },
  { path: '/dropdown', label: 'Dropdown 下拉菜单', group: '导航' },
  { path: '/menu', label: 'Menu 导航菜单', group: '导航' },
  { path: '/pagination', label: 'Pagination 分页', group: '导航' },
  { path: '/steps', label: 'Steps 步骤条', group: '导航' },
  { path: '/sticky-tool', label: 'StickyTool 侧边栏', group: '导航' },
  { path: '/tabs', label: 'Tabs 选项卡', group: '导航' },
  { path: '/auto-complete', label: 'AutoComplete 自动填充', group: '输入' },
  { path: '/cascader', label: 'Cascader 级联组件', group: '输入' },
  { path: '/checkbox', label: 'Checkbox 多选框', group: '输入' },
  { path: '/color-picker', label: 'ColorPicker 颜色选择器', group: '输入' },
  { path: '/date-picker', label: 'DatePicker 日期选择器', group: '输入' },
  { path: '/date-range-picker', label: 'DateRangePicker 日期范围', group: '输入' },
  { path: '/form', label: 'Form 表单', group: '输入' },
  { path: '/input', label: 'Input 输入框', group: '输入' },
  { path: '/input-adornment', label: 'InputAdornment 输入装饰器', group: '输入' },
  { path: '/input-number', label: 'InputNumber 数字输入框', group: '输入' },
  { path: '/tag-input', label: 'TagInput 标签输入框', group: '输入' },
  { path: '/radio', label: 'Radio 单选框', group: '输入' },
  { path: '/range-input', label: 'RangeInput 范围输入框', group: '输入' },
  { path: '/select', label: 'Select 选择器', group: '输入' },
  { path: '/select-input', label: 'SelectInput 筛选器输入框', group: '输入' },
  { path: '/slider', label: 'Slider 滑块', group: '输入' },
  { path: '/switch', label: 'Switch 开关', group: '输入' },
  { path: '/textarea', label: 'Textarea 多行文本框', group: '输入' },
  { path: '/transfer', label: 'Transfer 穿梭框', group: '输入' },
  { path: '/time-picker', label: 'TimePicker 时间选择器', group: '输入' },
  { path: '/tree-select', label: 'TreeSelect 树选择', group: '输入' },
  { path: '/upload', label: 'Upload 上传', group: '输入' },
  { path: '/avatar', label: 'Avatar 头像', group: '数据展示' },
  { path: '/badge', label: 'Badge 徽标', group: '数据展示' },
  { path: '/calendar', label: 'Calendar 日历', group: '数据展示' },
  { path: '/card', label: 'Card 卡片', group: '数据展示' },
  { path: '/collapse', label: 'Collapse 折叠面板', group: '数据展示' },
  { path: '/comment', label: 'Comment 评论', group: '数据展示' },
  { path: '/descriptions', label: 'Descriptions 描述', group: '数据展示' },
  { path: '/empty', label: 'Empty 空状态', group: '数据展示' },
  { path: '/image', label: 'Image 图片', group: '数据展示' },
  { path: '/image-viewer', label: 'ImageViewer 图片预览', group: '数据展示' },
  { path: '/list', label: 'List 列表', group: '数据展示' },
  { path: '/loading', label: 'Loading 加载', group: '数据展示' },
  { path: '/progress', label: 'Progress 进度条', group: '数据展示' },
  { path: '/qrcode', label: 'QRCode 二维码', group: '数据展示' },
  { path: '/skeleton', label: 'Skeleton 骨架屏', group: '数据展示' },
  { path: '/statistic', label: 'Statistic 统计数值', group: '数据展示' },
  { path: '/swiper', label: 'Swiper 轮播框', group: '数据展示' },
  { path: '/table', label: 'Table 表格', group: '数据展示' },
  { path: '/tag', label: 'Tag 标签', group: '数据展示' },
  { path: '/check-tag', label: 'CheckTag 可选标签', group: '数据展示' },
  { path: '/timeline', label: 'Timeline 时间轴', group: '数据展示' },
  { path: '/tooltip', label: 'Tooltip 文字提示', group: '数据展示' },
  { path: '/tree', label: 'Tree 树', group: '数据展示' },
  { path: '/watermark', label: 'Watermark 水印', group: '数据展示' },
  { path: '/rate', label: 'Rate 评分', group: '数据展示' },
  { path: '/alert', label: 'Alert 警告提醒', group: '消息提醒' },
  { path: '/dialog', label: 'Dialog 对话框', group: '消息提醒' },
  { path: '/drawer', label: 'Drawer 抽屉', group: '消息提醒' },
  { path: '/guide', label: 'Guide 引导', group: '消息提醒' },
  { path: '/message', label: 'Message 全局提示', group: '消息提醒' },
  { path: '/notification', label: 'Notification 消息通知', group: '消息提醒' },
  { path: '/popconfirm', label: 'Popconfirm 气泡确认框', group: '消息提醒' },
  { path: '/popup', label: 'Popup 弹出层', group: '消息提醒' },
];

/** 按分组统计，保持 DOCS_NAV 里的先后顺序。 */
export function groupNav(): { title: string; items: DocsNavItem[] }[] {
  const groups: { title: string; items: DocsNavItem[] }[] = [];
  for (const item of DOCS_NAV) {
    let group = groups.find((candidate) => candidate.title === item.group);
    if (!group) {
      group = { title: item.group, items: [] };
      groups.push(group);
    }
    group.items.push(item);
  }
  return groups;
}
