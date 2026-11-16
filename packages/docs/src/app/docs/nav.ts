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
  { path: '/divider', label: '分割线 Divider', group: '布局' },
  { path: '/space', label: '间距 Space', group: '布局' },
  { path: '/input', label: '输入框 Input', group: '数据录入' },
  { path: '/textarea', label: '文本域 Textarea', group: '数据录入' },
  { path: '/switch', label: '开关 Switch', group: '数据录入' },
  { path: '/checkbox', label: '多选框 Checkbox', group: '数据录入' },
  { path: '/radio', label: '单选框 Radio', group: '数据录入' },
  { path: '/select', label: '选择器 Select', group: '数据录入' },
  { path: '/form', label: '表单 Form', group: '数据录入' },
  { path: '/popup', label: '弹出层 Popup', group: '反馈' },
  { path: '/tooltip', label: '文字提示 Tooltip', group: '反馈' },
  { path: '/dialog', label: '对话框 Dialog', group: '反馈' },
  { path: '/drawer', label: '抽屉 Drawer', group: '反馈' },
  { path: '/message', label: '全局提示 Message', group: '反馈' },
  { path: '/notification', label: '通知 Notification', group: '反馈' },
  { path: '/loading', label: '加载 Loading', group: '反馈' },
  { path: '/tag', label: '标签 Tag', group: '数据展示' },
  { path: '/badge', label: '徽标 Badge', group: '数据展示' },
  { path: '/avatar', label: '头像 Avatar', group: '数据展示' },
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
