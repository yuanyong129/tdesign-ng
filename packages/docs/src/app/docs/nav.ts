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

export const DOCS_NAV: DocsNavItem[] = [
  { path: '/button', label: '按钮 Button', group: '通用' },
  { path: '/link', label: '链接 Link', group: '通用' },
  { path: '/typography', label: '排版 Typography', group: '通用' },
  { path: '/layout', label: '布局 Layout', group: '布局' },
  { path: '/grid', label: '栅格 Grid', group: '布局' },
  { path: '/divider', label: '分割线 Divider', group: '布局' },
  { path: '/space', label: '间距 Space', group: '布局' },
  { path: '/affix', label: '固钉 Affix', group: '布局' },
  { path: '/anchor', label: '锚点 Anchor', group: '导航' },
  { path: '/menu', label: '导航菜单 Menu', group: '导航' },
  { path: '/breadcrumb', label: '面包屑 Breadcrumb', group: '导航' },
  { path: '/steps', label: '步骤条 Steps', group: '导航' },
  { path: '/sticky-tool', label: '侧边悬浮 StickyTool', group: '导航' },
  { path: '/back-top', label: '回到顶部 BackTop', group: '导航' },
  { path: '/dropdown', label: '下拉菜单 Dropdown', group: '导航' },
  { path: '/input', label: '输入框 Input', group: '数据录入' },
  { path: '/input-number', label: '数字输入框 InputNumber', group: '数据录入' },
  { path: '/auto-complete', label: '自动补全 AutoComplete', group: '数据录入' },
  { path: '/select-input', label: '选择器输入 SelectInput', group: '数据录入' },
  { path: '/input-adornment', label: '前后缀 InputAdornment', group: '数据录入' },
  { path: '/tag-input', label: '标签输入框 TagInput', group: '数据录入' },
  { path: '/textarea', label: '文本域 Textarea', group: '数据录入' },
  { path: '/switch', label: '开关 Switch', group: '数据录入' },
  { path: '/checkbox', label: '多选框 Checkbox', group: '数据录入' },
  { path: '/radio', label: '单选框 Radio', group: '数据录入' },
  { path: '/select', label: '选择器 Select', group: '数据录入' },
  { path: '/form', label: '表单 Form', group: '数据录入' },
  { path: '/slider', label: '滑块 Slider', group: '数据录入' },
  { path: '/rate', label: '评分 Rate', group: '数据录入' },
  { path: '/range-input', label: '范围输入框 RangeInput', group: '数据录入' },
  { path: '/cascader', label: '级联选择 Cascader', group: '数据录入' },
  { path: '/tree-select', label: '树选择 TreeSelect', group: '数据录入' },
  { path: '/transfer', label: '穿梭框 Transfer', group: '数据录入' },
  { path: '/date-picker', label: '日期选择 DatePicker', group: '数据录入' },
  { path: '/date-range-picker', label: '日期范围 DateRangePicker', group: '数据录入' },
  { path: '/time-picker', label: '时间选择 TimePicker', group: '数据录入' },
  { path: '/color-picker', label: '颜色选择器 ColorPicker', group: '数据录入' },
  { path: '/upload', label: '上传 Upload', group: '数据录入' },
  { path: '/popup', label: '弹出层 Popup', group: '反馈' },
  { path: '/tooltip', label: '文字提示 Tooltip', group: '反馈' },
  { path: '/dialog', label: '对话框 Dialog', group: '反馈' },
  { path: '/drawer', label: '抽屉 Drawer', group: '反馈' },
  { path: '/message', label: '全局提示 Message', group: '反馈' },
  { path: '/notification', label: '通知 Notification', group: '反馈' },
  { path: '/alert', label: '警告提示 Alert', group: '反馈' },
  { path: '/loading', label: '加载 Loading', group: '反馈' },
  { path: '/popconfirm', label: '气泡确认 Popconfirm', group: '反馈' },
  { path: '/guide', label: '引导 Guide', group: '反馈' },
  { path: '/qrcode', label: '二维码 QRCode', group: '数据展示' },
  { path: '/card', label: '卡片 Card', group: '数据展示' },
  { path: '/calendar', label: '日历 Calendar', group: '数据展示' },
  { path: '/tag', label: '标签 Tag', group: '数据展示' },
  { path: '/check-tag', label: '可选标签 CheckTag', group: '数据展示' },
  { path: '/badge', label: '徽标 Badge', group: '数据展示' },
  { path: '/avatar', label: '头像 Avatar', group: '数据展示' },
  { path: '/pagination', label: '分页 Pagination', group: '数据展示' },
  { path: '/table', label: '表格 Table', group: '数据展示' },
  { path: '/tree', label: '树形控件 Tree', group: '数据展示' },
  { path: '/tabs', label: '选项卡 Tabs', group: '数据展示' },
  { path: '/collapse', label: '折叠面板 Collapse', group: '数据展示' },
  { path: '/empty', label: '空状态 Empty', group: '数据展示' },
  { path: '/skeleton', label: '骨架屏 Skeleton', group: '数据展示' },
  { path: '/swiper', label: '轮播 Swiper', group: '数据展示' },
  { path: '/progress', label: '进度条 Progress', group: '数据展示' },
  { path: '/list', label: '列表 List', group: '数据展示' },
  { path: '/descriptions', label: '描述列表 Descriptions', group: '数据展示' },
  { path: '/comment', label: '评论 Comment', group: '数据展示' },
  { path: '/timeline', label: '时间轴 Timeline', group: '数据展示' },
  { path: '/statistic', label: '统计数值 Statistic', group: '数据展示' },
  { path: '/image', label: '图片 Image', group: '数据展示' },
  { path: '/image-viewer', label: '图片预览 ImageViewer', group: '数据展示' },
  { path: '/config-provider', label: '全局配置 ConfigProvider', group: '其他' },
  { path: '/watermark', label: '水印 Watermark', group: '其他' },
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
