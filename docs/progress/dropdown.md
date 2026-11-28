# Dropdown 下拉菜单 · 开发进度

> 本文件由 `pnpm gen:progress` 生成，请勿手改；进度真相是 `align-check` 与源码。

- 目录：`packages/ng-components/src/components/dropdown/`
- 文档页：`/dropdown`（`packages/docs/src/app/docs/dropdown/dropdown.component.ts`）
- 状态：✅ 已对齐上游全部属性

## 概览

| 指标 | 数值 |
| --- | --- |
| 上游属性 | 21 |
| 已对齐 | 19 |
| 覆盖率 | 90.5% |
| 深度债 | 0（D1 0 / D2 0 / D3 0） |
| Angular 惯用映射 | 2（插槽 / 双向绑定 / 事件名，不计债） |
| 未登记缺失 | 0 |
| 文档示例 | 3 个 |

## 组件明细

### `TDropdown`（`<t-dropdown>`）

上游接口 `TdDropdownProps`；上游属性 13、已对齐 12（92.3%）；深度债 0 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `direction` | DropdownDirection | 'right' | 子菜单展开方向 |
| `disabled` | boolean | false | 是否禁用 |
| `hideAfterItemClick` | boolean | true | 点击选项后是否关闭 |
| `maxColumnWidth` | string \| number | 100 | 选项最大宽度 |
| `maxHeight` | number | 300 | 面板最大高度 |
| `minColumnWidth` | string \| number | 10 | 选项最小宽度 |
| `options` | DropdownOption[] | [] | 菜单选项 |
| `panelBottomContent` | DropdownContent | undefined | 面板底部内容 |
| `panelTopContent` | DropdownContent | undefined | 面板顶部内容 |
| `placement` | DropdownPlacement | 'bottom-left' | 弹层位置 |
| `popupProps` | PopupOptions \| undefined | undefined | 弹层透传选项 |
| `trigger` | DropdownTrigger | 'hover' | 触发方式 |

**已实现事件**

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `click` | DropdownClickEvent | 点击菜单项 |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `onClick` | Angular 惯用映射 | Angular 用 (click) 输出，参数 { item, e } |

### `TDropdownItem`（`<t-dropdown-item>`）

上游接口 `TdDropdownItemProps`；上游属性 8、已对齐 7（87.5%）；深度债 0 项；未登记缺失 0 项。

**已实现输入**

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `active` | boolean | false | 是否高亮选中 |
| `content` | DropdownContent | undefined | 选项内容 |
| `disabled` | boolean | false | 是否禁用 |
| `divider` | boolean | false | 是否显示分割线 |
| `prefixIcon` | DropdownContent | undefined | 前置图标 |
| `theme` | DropdownItemTheme | 'default' | 选项主题色 |
| `value` | DropdownValue | undefined | 选项值 |
| `maxColumnWidth` | string \| number | 100 | 选项最大宽度 |
| `minColumnWidth` | string \| number | 10 | 选项最小宽度 |
| `hasSubmenu` | boolean | false | 是否含子菜单 |

**已实现事件**

| 事件 | 参数 | 说明 |
| --- | --- | --- |
| `click` | DropdownItemClickEvent | 点击选项 |

**未实现（深度债）**

| 上游属性 | 类别 | 原因 |
| --- | --- | --- |
| `onClick` | Angular 惯用映射 | Angular 用 (click) 输出，参数 { value, e }；数据里的 onClick 仍会被调用 |

## 文档示例

- `packages/docs/src/app/docs/dropdown/demos/dropdown-base.ts`
- `packages/docs/src/app/docs/dropdown/demos/dropdown-disabled.ts`
- `packages/docs/src/app/docs/dropdown/demos/dropdown-split.ts`
