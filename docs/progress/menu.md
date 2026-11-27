# 导航菜单 Menu · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/menu/`
- 文档页：`/menu`（`packages/docs/src/app/docs/menu/menu.component.ts`）
- 状态：🚧 有深度债 4 项

## 概览

| 指标 | 数值 |
| --- | --- |
| 上游属性 | 34 |
| 已对齐 | 24 |
| 覆盖率 | 70.6% |
| 深度债 | 4（D1 0 / D2 4 / D3 0） |
| Angular 惯用映射 | 6（插槽 / 双向绑定 / 事件名，不计债） |
| 未登记缺失 | 0 |
| 文档示例 | 4 个 |

## 组件明细

### `TMenu`（`<t-menu>`）

上游接口 `TdMenuProps`；上游属性 14、已对齐 12（85.7%）；深度债 0 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `collapsed` | boolean | false | 是否折叠成图标列 |
| `collapsedWidth` | string \| number \| undefined | undefined | 折叠后的宽度，不设置时取 `width` 数组的第二项 |
| `defaultExpanded` | MenuValue[] | [] | 默认展开的子菜单取值，非受控 |
| `defaultValue` | MenuValue \| undefined | undefined | 默认选中的菜单项，非受控 |
| `expandMutex` | boolean | false | 同级子菜单是否互斥展开 |
| `expandType` | MenuExpandType | 'normal' | 子菜单展开形态 |
| `expanded` | MenuValue[] \| undefined | undefined | 展开的子菜单取值，可双向绑定 |
| `expandIcon` | MenuContent | undefined | 子菜单的展开图标，不设置时用内置箭头 |
| `logo` | MenuContent | undefined | 菜单顶部 logo 区域 |
| `mode` | MenuMode | 'vertical' | 菜单形态 |
| `modelValue` | MenuValue \| undefined | undefined | 选中的菜单项，`value` 的别名（v-model 语义） |
| `operations` | MenuContent | undefined | 菜单右上角操作区域 |
| `theme` | MenuTheme | 'light' | 菜单主题 |
| `value` | MenuValue \| undefined | undefined | 选中的菜单项，可双向绑定 |
| `width` | string \| number \| Array<string \| number> | '232px' | 菜单宽度，折叠时取数组第二项，默认折叠宽度 64px |

**已实现事件**

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `change` | MenuChangeEvent | 选中项变化，参数为 `{ value }` |
| `expand` | MenuValue[] | 展开的子菜单取值变化 |
| `expandedChange` | MenuValue[] | 展开的子菜单取值变化，用于双向绑定 |
| `collapsedChange` | boolean | 折叠状态变化，配合 `toggleCollapsed()` 使用 |
| `valueChange` | MenuValue \| undefined | 选中值变化，用于双向绑定 |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `onChange` | Angular 惯用映射 | Angular 用 (change) 输出，参数 { value } |
| `onExpand` | Angular 惯用映射 | Angular 用 (expand) 输出，参数 MenuValue[]（同时提供 [(expanded)]） |

### `TMenuGroup`（`<t-menu-group>`）

上游接口 `TdMenuGroupProps`；上游属性 1、已对齐 1（100.0%）；深度债 0 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `title` | MenuContent | undefined | 分组标题 |

### `TMenuItem`（`<t-menu-item>`）

上游接口 `TdMenuItemProps`；上游属性 12、已对齐 6（50.0%）；深度债 4 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | MenuValue \| undefined | undefined | 菜单项取值，与菜单的 `value` 比较决定是否选中 |
| `icon` | MenuContent | undefined | 菜单项图标 |
| `content` | MenuContent | undefined | 菜单项文本，也可直接用内容投影 |
| `disabled` | boolean | false | 是否禁用 |
| `href` | string | '' | 链接地址，设置后菜单项渲染为 `a` 标签 |
| `target` | MenuTarget | '_self' | 链接的打开方式 |

**已实现事件**

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `click` | MenuClickEvent | 点击菜单项，参数为 `{ e, value }` |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `default` | Angular 惯用映射 | [D1] Angular 用 <ng-content> 投影（同时提供 content 字符串入口），不再开同名 input |
| `onClick` | Angular 惯用映射 | Angular 用 (click) 输出，参数 { e, value } |
| `replace` | D2 录入与反馈线 | [D2] 同上（history.replace 语义依赖 router） |
| `router` | D2 录入与反馈线 | [D2] 同上 |
| `routerLink` | D2 录入与反馈线 | [D2] 同上，需要 @angular/router peer dep 才能提供 RouterLink 语义 |
| `to` | D2 录入与反馈线 | [D2] 库未声明 @angular/router peer 依赖，接入路由后由使用方用 (click) + Router 自行跳转 |

### `TSubmenu`（`<t-submenu>`）

上游接口 `TdSubmenuProps`；上游属性 7、已对齐 5（71.4%）；深度债 0 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `value` | MenuValue \| undefined | undefined | 子菜单取值，同时是展开状态与选中路径的依据 |
| `title` | MenuContent | undefined | 子菜单标题 |
| `icon` | MenuContent | undefined | 子菜单图标 |
| `expandIcon` | MenuContent | undefined | 展开图标，不设置时用内置箭头 |
| `disabled` | boolean | false | 是否禁用 |
| `popupProps` | PopupOptions \| undefined | undefined | 浮层模式的弹层配置，菜单自动定位及显式禁用优先；内联模式不使用 |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `content` | Angular 惯用映射 | [D1] Angular 用 title 或 <ng-content> 投影标题，不再重复 content 入口 |
| `default` | Angular 惯用映射 | [D1] Angular 用 <ng-content> 投影子菜单项 |

## 文档示例

- `packages/docs/src/app/docs/menu/demos/menu-base.ts`
- `packages/docs/src/app/docs/menu/demos/menu-collapsed.ts`
- `packages/docs/src/app/docs/menu/demos/menu-horizontal.ts`
- `packages/docs/src/app/docs/menu/demos/menu-popup-props.ts`
