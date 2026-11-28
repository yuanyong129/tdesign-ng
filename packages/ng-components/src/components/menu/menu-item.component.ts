import { InitialRender } from '../../_utils/initial-render';
import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  forwardRef,
  inject,
  input,
  output,
} from '@angular/core';
import { T_MENU, T_MENU_NODE, T_SUBMENU, asTemplate } from './menu.types';
import type { MenuClickEvent, MenuContent, MenuNode, MenuTarget, MenuValue } from './menu.types';

/**
 * 菜单项：`value` 与菜单的选中值比较，命中时高亮。
 * @zh 菜单项 @en Menu item
 */
@Component({
  selector: 't-menu-item',
  hostDirectives: [InitialRender],
  standalone: true,
  imports: [NgTemplateOutlet],
  templateUrl: './menu-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    role: 'menuitem',
    'data-t-menu-node': '',
    '[class]': 'classes()',
    '[attr.tabindex]': 'disabled() ? -1 : 0',
    '[attr.aria-disabled]': "disabled() ? 'true' : null",
    '[attr.aria-selected]': "isActive() ? 'true' : 'false'",
    '(click)': 'handleClick($event)',
    '(keydown)': 'handleKeydown($event)',
  },
  providers: [{ provide: T_MENU_NODE, useExisting: forwardRef(() => TMenuItem) }],
})
export class TMenuItem implements MenuNode {
  readonly kind = 'menu-item' as const;

  /** @zh 菜单项取值，与菜单的 `value` 比较决定是否选中 @en Menu item value @defaultValue undefined */
  readonly value = input<MenuValue | undefined>(undefined);

  /** @zh 菜单项图标 @en Icon of the menu item @defaultValue undefined */
  readonly icon = input<MenuContent>(undefined);

  /** @zh 菜单项文本，也可直接用内容投影 @en Text of the menu item, or use content projection @defaultValue undefined */
  readonly content = input<MenuContent>(undefined);

  /** @zh 是否禁用 @en Whether the menu item is disabled @defaultValue false */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** @zh 链接地址，设置后菜单项渲染为 `a` 标签 @en Link href, renders an anchor when set @defaultValue '' */
  readonly href = input('');

  /** @zh 链接的打开方式 @en Link target @defaultValue '_self' @values _blank,_self,_parent,_top */
  readonly target = input<MenuTarget>('_self');

  /** @zh 点击菜单项，参数为 `{ e, value }` @en Emitted when the menu item is clicked */
  readonly click = output<MenuClickEvent>();

  private readonly host = inject(T_MENU, { optional: true });
  private readonly parentSubmenu = inject(T_SUBMENU, { optional: true });

  /** 是否处于选中状态。 */
  readonly isActive = computed(() => {
    const value = this.value();
    return value !== undefined && this.host?.activeValue() === value;
  });

  /** 菜单项没有子节点。 */
  readonly children = computed<readonly MenuNode[]>(() => []);

  protected readonly toTemplate = asTemplate;

  protected readonly classes = computed(() => {
    const classes = ['t-menu__item'];
    if (this.isActive()) classes.push('t-is-active');
    if (this.disabled()) classes.push('t-is-disabled');
    if (!this.icon()) classes.push('t-menu__item--plain');
    return classes.join(' ');
  });

  /** 选中当前菜单项；禁用时不做任何事。 */
  protected handleClick(event: MouseEvent | KeyboardEvent): void {
    if (this.disabled()) return;
    event.stopPropagation();
    const value = this.value();
    this.host?.select(value);
    this.parentSubmenu?.closePopup();
    this.click.emit({ e: event, value });
  }

  /** Enter / 空格 等价于点击。 */
  protected handleKeydown(event: KeyboardEvent): void {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    this.handleClick(event);
  }
}
