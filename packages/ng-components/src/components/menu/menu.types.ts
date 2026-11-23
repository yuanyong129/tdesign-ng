import { InjectionToken, TemplateRef } from '@angular/core';
import type { Signal } from '@angular/core';

/** 菜单项 / 子菜单的取值。 @zh 菜单取值 @en Menu value */
export type MenuValue = string | number;

/** 菜单节点的富文本属性：字符串按文本渲染，`TemplateRef` 交给 `*ngTemplateOutlet`。 @zh 菜单内容 @en Menu content */
export type MenuContent = string | TemplateRef<unknown> | undefined;

/** 菜单主题取值。 @zh 菜单主题 @en Menu theme @values light,dark */
export const MENU_THEMES = ['light', 'dark'] as const;

/** 菜单主题。 @zh 菜单主题 @en Menu theme @defaultValue 'light' @values light,dark */
export type MenuTheme = (typeof MENU_THEMES)[number];

/** 菜单形态取值。 @zh 菜单形态 @en Menu mode @values vertical,horizontal */
export const MENU_MODES = ['vertical', 'horizontal'] as const;

/** 菜单形态：`vertical` 竖向菜单，`horizontal` 横向菜单。 @zh 菜单形态 @en Menu mode @defaultValue 'vertical' @values vertical,horizontal */
export type MenuMode = (typeof MENU_MODES)[number];

/** 展开形态取值。 @zh 展开形态 @en Expand type @values normal,popup */
export const MENU_EXPAND_TYPES = ['normal', 'popup'] as const;

/** 子菜单展开形态：`normal` 在菜单内部展开，`popup` 用浮层展开。 @zh 展开形态 @en Expand type @defaultValue 'normal' @values normal,popup */
export type MenuExpandType = (typeof MENU_EXPAND_TYPES)[number];

/** 菜单项链接的打开方式。 @zh 链接打开方式 @en Link target @defaultValue '_self' @values _blank,_self,_parent,_top */
export type MenuTarget = '_blank' | '_self' | '_parent' | '_top';

/** 选中值变化时携带的上下文。 @zh 选中变化上下文 @en Change context */
export interface MenuChangeEvent {
  /** 新的选中值 */
  value: MenuValue | undefined;
}

/** 点击菜单项时携带的上下文。 @zh 点击上下文 @en Click context */
export interface MenuClickEvent {
  /** 原始事件，鼠标点击或键盘激活 */
  e: MouseEvent | KeyboardEvent;
  /** 被点击菜单项的取值 */
  value: MenuValue | undefined;
}

/**
 * 菜单树节点的统一契约：各级组件（菜单项 / 子菜单 / 分组）都实现它，
 * 父级通过内容查询拿到直接子节点，从而推导展开互斥与选中路径。
 * @zh 菜单树节点 @en Menu tree node
 */
export interface MenuNode {
  /** 节点种类 */
  readonly kind: 'menu-item' | 'submenu' | 'menu-group';
  /** 节点取值 */
  readonly value: Signal<MenuValue | undefined>;
  /** 节点是否处于选中路径上 */
  readonly isActive: Signal<boolean>;
  /** 直接子节点 */
  readonly children: Signal<readonly MenuNode[]>;
}

/** 菜单下发给所有子孙的父级契约。 @zh 菜单父级 @en Menu host */
export interface MenuHost {
  /** 主题 */
  readonly theme: Signal<MenuTheme>;
  /** 是否横向菜单 */
  readonly isHead: Signal<boolean>;
  /** 生效的折叠状态 */
  readonly isCollapsed: Signal<boolean>;
  /** 生效的展开形态（折叠时强制为 popup） */
  readonly effectiveExpandType: Signal<MenuExpandType>;
  /** 当前选中值 */
  readonly activeValue: Signal<MenuValue | undefined>;
  /** 当前展开的子菜单取值集合 */
  readonly expandedValues: Signal<readonly MenuValue[]>;
  /** 子菜单展开图标 */
  readonly expandIcon: Signal<MenuContent>;
  /** 选中某个菜单项 */
  select(value: MenuValue | undefined): void;
  /** 切换某个子菜单的展开状态 */
  toggleExpand(value: MenuValue | undefined): void;
}

/** 子菜单下发给后代子菜单的父级契约。 @zh 子菜单父级 @en Submenu host */
export interface SubmenuHost {
  /** 是否用浮层展开（横向 / 折叠 / 嵌套在浮层内） */
  readonly popupMode: Signal<boolean>;
  /** 收起浮层，并向上逐级收起祖先浮层 */
  closePopup(): void;
}

/** 菜单父级注入令牌。 @zh 菜单令牌 @en Menu token */
export const T_MENU = new InjectionToken<MenuHost>('TMenu');

/** 子菜单父级注入令牌。 @zh 子菜单令牌 @en Submenu token */
export const T_SUBMENU = new InjectionToken<SubmenuHost>('TSubmenu');

/** 菜单树节点注入令牌，用于父级内容查询。 @zh 菜单节点令牌 @en Menu node token */
export const T_MENU_NODE = new InjectionToken<MenuNode>('TMenuNode');

/**
 * 把富文本属性取出成模板，非模板返回 `null`。
 * @zh 取出模板 @en Extract template
 */
export function asTemplate(value: MenuContent): TemplateRef<unknown> | null {
  return value instanceof TemplateRef ? value : null;
}
