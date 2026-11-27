import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  contentChildren,
  forwardRef,
  inject,
  input,
  signal,
} from '@angular/core';
import { TPopup } from '../popup';
import type { PopupPlacement } from '../popup';
import { mergePopupClassNames, mergePopupOptions } from '../popup/popup.types';
import type { PopupOptions } from '../popup/popup.types';
import { T_MENU, T_MENU_NODE, T_SUBMENU, asTemplate } from './menu.types';
import type { MenuContent, MenuHost, MenuNode, MenuValue, SubmenuHost } from './menu.types';

/**
 * 子菜单：竖向菜单在内部展开，横向菜单或折叠态用浮层展开。
 * @zh 子菜单 @en Submenu
 */
@Component({
  selector: 't-submenu',
  standalone: true,
  imports: [NgTemplateOutlet, TPopup],
  templateUrl: './submenu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    role: 'none',
    '[class]': 'classes()',
  },
  providers: [
    { provide: T_MENU_NODE, useExisting: forwardRef(() => TSubmenu) },
    { provide: T_SUBMENU, useExisting: forwardRef(() => TSubmenu) },
  ],
})
export class TSubmenu implements MenuNode, SubmenuHost {
  readonly kind = 'submenu' as const;

  /** @zh 子菜单取值，同时是展开状态与选中路径的依据 @en Submenu value @defaultValue undefined */
  readonly value = input<MenuValue | undefined>(undefined);

  /** @zh 子菜单标题 @en Title of the submenu @defaultValue undefined */
  readonly title = input<MenuContent>(undefined);

  /** @zh 子菜单图标 @en Icon of the submenu @defaultValue undefined */
  readonly icon = input<MenuContent>(undefined);

  /** @zh 展开图标，不设置时用内置箭头 @en Expand icon, falls back to the built-in arrow @defaultValue undefined */
  readonly expandIcon = input<MenuContent>(undefined);

  /** @zh 是否禁用 @en Whether the submenu is disabled @defaultValue false */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** @zh 浮层模式的弹层配置，菜单自动定位及显式禁用优先；内联模式不使用 @en Popup options in popup mode; menu placement and explicit disabling take precedence; ignored inline @defaultValue undefined */
  readonly popupProps = input<PopupOptions | undefined>(undefined);

  protected readonly mergedDisabled = computed(() => this.disabled() || (this.popupMode() && !!this.popupProps()?.disabled));
  protected readonly popupOptions = computed(() => mergePopupOptions(
    { trigger: 'hover', delay: [0, 100], showArrow: false }, this.popupProps(),
    { placement: this.popupPlacement(), disabled: this.mergedDisabled() },
  ));

  private readonly host = inject(T_MENU, { optional: true });
  private readonly parentSubmenu = inject(T_SUBMENU, { optional: true, skipSelf: true });
  private readonly childNodes = contentChildren(T_MENU_NODE);
  private readonly popupVisible = signal(false);

  /** 子菜单的直接子节点。 */
  readonly children = computed<readonly MenuNode[]>(() => this.childNodes());

  /** 是否用浮层展开：横向菜单、折叠态、或自身嵌在浮层里。 */
  readonly popupMode = computed(() => {
    if (this.host?.isHead()) return true;
    if (this.host?.effectiveExpandType() === 'popup') return true;
    return this.parentSubmenu?.popupMode() ?? false;
  });

  /** 是否展开：浮层形态看浮层显隐，内联形态看菜单的展开取值。 */
  protected readonly opened = computed(() => {
    if (this.popupMode()) return this.popupVisible() && !this.mergedDisabled();
    const value = this.value();
    return value !== undefined && (this.host?.expandedValues() ?? []).includes(value);
  });

  /** 自身或后代是否处于选中路径上。 */
  readonly isActive = computed(() => {
    const active = this.host?.activeValue();
    if (active === undefined) return false;
    if (this.value() === active) return true;
    return this.children().some((node) => node.isActive());
  });

  protected readonly classes = computed(() => {
    const classes = ['t-submenu'];
    if (this.opened()) classes.push('t-is-opened');
    if (this.mergedDisabled()) classes.push('t-is-disabled');
    return classes.join(' ');
  });

  protected readonly headerClasses = computed(() => {
    const classes = ['t-menu__item'];
    if (this.opened()) classes.push('t-is-opened');
    if (this.mergedDisabled()) classes.push('t-is-disabled');
    if (this.isActive()) classes.push('t-is-active');
    return classes.join(' ');
  });

  protected readonly subClasses = computed(() => 't-menu__sub');

  protected readonly popupPlacement = computed<PopupPlacement>(() =>
    this.host?.isHead() ? 'bottom-left' : 'right-top',
  );

  /** 浮层根节点的类名，对应上游 `overlayClassName`。 */
  protected readonly overlayClasses = computed(() => {
    const classes = [`t-menu--${this.host?.theme() ?? 'light'}`];
    if (this.host?.isHead()) classes.push('t-is-head-menu');
    if (this.parentSubmenu) classes.push('t-menu-is-nested');
    return mergePopupClassNames(classes.join(' '), this.popupProps()?.overlayClassName);
  });

  /** 浮层内容类名，对应上游 `overlayInnerClassName`。 */
  protected readonly overlayInnerClasses = computed(() => {
    const classes = ['t-menu__popup', this.host?.isHead() ? 't-is-horizontal' : 't-is-vertical'];
    if (this.opened()) classes.push('t-is-opened');
    return mergePopupClassNames(classes.join(' '), this.popupProps()?.overlayInnerClassName);
  });

  protected readonly spacerClasses = computed(() => {
    const classes = ['t-menu__spacer'];
    if (this.host?.isHead()) {
      classes.push('t-menu__spacer--top');
    } else {
      classes.push('t-menu__spacer--left');
    }
    return classes.join(' ');
  });

  protected readonly panelClasses = computed(() => {
    const classes = ['t-menu__popup-wrapper'];
    if (this.host?.isHead()) classes.push('t-menu__popup-overflow');
    return classes.join(' ');
  });

  /** 生效的展开图标：自身优先，其次取菜单的。 */
  protected readonly effectiveExpandIcon = computed<MenuContent>(
    () => this.expandIcon() ?? this.host?.expandIcon() ?? undefined,
  );

  protected readonly toTemplate = asTemplate;

  /** 浮层显隐变化：浮层形态下由 `t-popup` 驱动。 */
  protected handlePopupVisible(visible: boolean): void {
    this.popupVisible.set(visible);
  }

  /** 点击标题：浮层形态切换浮层，内联形态切换菜单的展开取值。 */
  protected toggle(event: Event): void {
    if (this.mergedDisabled()) return;
    event.stopPropagation();
    if (this.popupMode()) {
      this.popupVisible.update((visible) => !visible);
      return;
    }
    this.host?.toggleExpand(this.value());
  }

  /** Enter / 空格 展开收起，方向键进入或退出浮层。 */
  protected handleKeydown(event: KeyboardEvent): void {
    if (this.mergedDisabled()) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.toggle(event);
      return;
    }
    if (!this.popupMode()) return;
    if (event.key === 'ArrowRight' && !this.opened()) {
      event.preventDefault();
      this.popupVisible.set(true);
    } else if (event.key === 'ArrowLeft' && this.opened()) {
      event.preventDefault();
      this.popupVisible.set(false);
    }
  }

  /** 收起浮层，并逐级收起祖先浮层。 */
  closePopup(): void {
    if (!this.popupMode()) return;
    this.popupVisible.set(false);
    this.parentSubmenu?.closePopup();
  }
}
