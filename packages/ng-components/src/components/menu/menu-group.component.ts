import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  contentChildren,
  forwardRef,
  input,
  signal,
} from '@angular/core';
import { T_MENU_NODE, asTemplate } from './menu.types';
import type { MenuContent, MenuNode } from './menu.types';

/**
 * 菜单分组：给一组菜单项加标题。
 * @zh 菜单分组 @en Menu group
 */
@Component({
  selector: 't-menu-group',
  standalone: true,
  imports: [NgTemplateOutlet],
  templateUrl: './menu-group.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    role: 'group',
    '[class]': "'t-menu-group'",
  },
  providers: [{ provide: T_MENU_NODE, useExisting: forwardRef(() => TMenuGroup) }],
})
export class TMenuGroup implements MenuNode {
  readonly kind = 'menu-group' as const;

  /** @zh 分组标题 @en Title of the group @defaultValue undefined */
  readonly title = input<MenuContent>(undefined);

  /** 分组没有取值，仅用于把子节点挂到菜单树上。 */
  readonly value = computed(() => undefined);

  /** 分组自身不会被选中。 */
  readonly isActive = signal(false);

  private readonly childNodes = contentChildren(T_MENU_NODE);

  /** 分组的直接子节点。 */
  readonly children = computed<readonly MenuNode[]>(() => this.childNodes());

  protected readonly toTemplate = asTemplate;
}
