import { InitialRender } from '../../_utils/initial-render';
import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  contentChildren,
  effect,
  forwardRef,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import {
  T_MENU,
  T_MENU_NODE,
  asTemplate,
} from './menu.types';
import type {
  MenuChangeEvent,
  MenuContent,
  MenuExpandType,
  MenuHost,
  MenuMode,
  MenuNode,
  MenuTheme,
  MenuValue,
} from './menu.types';

/**
 * 导航菜单：竖向 / 横向两种形态，配合 `<t-submenu>`、`<t-menu-item>`、`<t-menu-group>` 递归渲染。
 * @zh 导航菜单 @en Menu
 */
@Component({
  selector: 't-menu',
  hostDirectives: [InitialRender],
  standalone: true,
  imports: [NgTemplateOutlet],
  templateUrl: './menu.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'classes()',
    '[style.width]': 'rootWidth()',
    '[style.height]': 'rootHeight()',
    '(keydown)': 'handleKeydown($event)',
  },
  providers: [{ provide: T_MENU, useExisting: forwardRef(() => TMenu) }],
})
export class TMenu implements MenuHost {
  /** @zh 是否折叠成图标列 @en Whether the menu is collapsed @defaultValue false */
  readonly collapsed = input(false, { transform: booleanAttribute });

  /** @zh 折叠后的宽度，不设置时取 `width` 数组的第二项 @en Width when collapsed, falls back to the second item of `width` @defaultValue undefined */
  readonly collapsedWidth = input<string | number | undefined>(undefined);

  /** @zh 默认展开的子菜单取值，非受控 @en Default expanded submenu values, uncontrolled @defaultValue [] */
  readonly defaultExpanded = input<MenuValue[]>([]);

  /** @zh 默认选中的菜单项，非受控 @en Default selected value, uncontrolled @defaultValue undefined */
  readonly defaultValue = input<MenuValue | undefined>(undefined);

  /** @zh 同级子菜单是否互斥展开 @en Whether sibling submenus expand mutually exclusively @defaultValue false */
  readonly expandMutex = input(false, { transform: booleanAttribute });

  /** @zh 子菜单展开形态 @en Submenu expand type @defaultValue 'normal' @values normal,popup */
  readonly expandType = input<MenuExpandType>('normal');

  /** @zh 展开的子菜单取值，可双向绑定 @en Expanded submenu values @defaultValue undefined */
  readonly expanded = input<MenuValue[] | undefined>(undefined);

  /** @zh 子菜单的展开图标，不设置时用内置箭头 @en Expand icon of submenus, falls back to the built-in arrow @defaultValue undefined */
  readonly expandIcon = input<MenuContent>(undefined);

  /** @zh 菜单顶部 logo 区域 @en Logo area at the top of the menu @defaultValue undefined */
  readonly logo = input<MenuContent>(undefined);

  /** @zh 菜单形态 @en Menu mode @defaultValue 'vertical' @values vertical,horizontal */
  readonly mode = input<MenuMode>('vertical');

  /** @zh 选中的菜单项，`value` 的别名（v-model 语义） @en Selected value, alias of `value` @defaultValue undefined */
  readonly modelValue = input<MenuValue | undefined>(undefined);

  /** @zh 菜单右上角操作区域 @en Operations area at the top right of the menu @defaultValue undefined */
  readonly operations = input<MenuContent>(undefined);

  /** @zh 菜单主题 @en Menu theme @defaultValue 'light' @values light,dark */
  readonly theme = input<MenuTheme>('light');

  /** @zh 选中的菜单项，可双向绑定 @en Selected value @defaultValue undefined */
  readonly value = input<MenuValue | undefined>(undefined);

  /** @zh 菜单宽度，折叠时取数组第二项，默认折叠宽度 64px @en Menu width @defaultValue '232px' */
  readonly width = input<string | number | Array<string | number>>('232px');

  /** @zh 选中项变化，参数为 `{ value }` @en Emitted when the selected value changes */
  readonly change = output<MenuChangeEvent>();

  /** @zh 展开的子菜单取值变化 @en Emitted when expanded values change */
  readonly expand = output<MenuValue[]>();

  /** @zh 展开的子菜单取值变化，用于双向绑定 @en Emitted when expanded values change, used for two-way binding */
  readonly expandedChange = output<MenuValue[]>();

  /** @zh 折叠状态变化，配合 `toggleCollapsed()` 使用 @en Emitted when the collapsed state changes */
  readonly collapsedChange = output<boolean>();

  /** @zh 选中值变化，用于双向绑定 @en Emitted when the selected value changes, used for two-way binding */
  readonly valueChange = output<MenuValue | undefined>();

  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly innerValue = signal<MenuValue | undefined>(undefined);
  private readonly innerExpanded = signal<MenuValue[]>([]);
  private readonly innerCollapsed = signal<boolean | undefined>(undefined);
  private readonly rootNodes = contentChildren(T_MENU_NODE);
  private expandedSeeded = false;
  private valueSeeded = false;

  /** 当前选中值：受控的 `value` / `modelValue` 优先，否则回落到内部状态。 */
  readonly activeValue = computed<MenuValue | undefined>(
    () => this.value() ?? this.modelValue() ?? this.innerValue(),
  );

  /** 是否横向菜单（对应上游的 `THeadMenu`）。 */
  readonly isHead = computed(() => this.mode() === 'horizontal');

  /** 生效的折叠状态：`toggleCollapsed()` 之后以内部状态为准，否则跟随 `collapsed`。 */
  readonly isCollapsed = computed(() => this.innerCollapsed() ?? this.collapsed());

  /** 生效的展开形态：折叠时强制走浮层。 */
  readonly effectiveExpandType = computed<MenuExpandType>(() =>
    this.isCollapsed() ? 'popup' : this.expandType(),
  );

  /** 当前展开的子菜单取值。 */
  readonly expandedValues = computed<MenuValue[]>(
    () => this.expanded() ?? this.innerExpanded(),
  );

  /** 菜单树上的全部节点及其父级取值，用于推导同级互斥。 */
  private readonly flatNodes = computed(() => {
    const result: Array<{ node: MenuNode; parent: MenuValue | undefined }> = [];
    const walk = (nodes: readonly MenuNode[], parent: MenuValue | undefined): void => {
      for (const node of nodes) {
        result.push({ node, parent });
        walk(node.children(), node.value() ?? parent);
      }
    };
    walk(this.rootNodes(), undefined);
    return result;
  });

  protected readonly classes = computed(() => {
    const theme = `t-menu--${this.theme()}`;
    const classes = this.isHead()
      ? ['t-menu', 't-head-menu', theme]
      : ['t-default-menu', theme, this.isCollapsed() ? 't-is-collapsed' : ''];
    return classes.filter(Boolean).join(' ');
  });

  protected readonly innerClasses = computed(() =>
    this.isHead() ? 't-head-menu__inner' : 't-default-menu__inner',
  );

  protected readonly listClasses = computed(() =>
    this.isHead() ? 't-menu' : 't-menu t-menu--scroll',
  );

  /** 菜单方向，用于 `aria-orientation`。 */
  protected readonly orientation = computed(() => (this.isHead() ? 'horizontal' : 'vertical'));

  /** 菜单宽度：横向菜单交给样式自适应，竖向菜单按 `width` / `collapsedWidth` 计算。 */
  protected readonly rootWidth = computed<string | null>(() => {
    if (this.isHead()) return null;
    const width = this.width();
    const expandedWidth = Array.isArray(width) ? this.formatWidth(width[0]) : this.formatWidth(width);
    const arrayCollapsedWidth = Array.isArray(width) ? this.formatWidth(width[1]) : '';
    if (!this.isCollapsed()) return expandedWidth || null;
    return this.formatWidth(this.collapsedWidth()) || arrayCollapsedWidth || '64px';
  });

  protected readonly rootHeight = computed<string | null>(() => (this.isHead() ? null : '100%'));

  constructor() {
    effect(() => {
      const expanded = this.defaultExpanded();
      untracked(() => {
        if (this.expandedSeeded) return;
        this.expandedSeeded = true;
        if (expanded.length) this.innerExpanded.set([...expanded]);
      });
    });

    effect(() => {
      const value = this.defaultValue();
      untracked(() => {
        if (this.valueSeeded) return;
        this.valueSeeded = true;
        if (value !== undefined && this.value() === undefined && this.modelValue() === undefined) {
          this.innerValue.set(value);
        }
      });
    });

    // 外部改写 `collapsed` 时以输入为准，内部折叠状态让位。
    effect(() => {
      this.collapsed();
      untracked(() => this.innerCollapsed.set(undefined));
    });
  }

  /** 切换折叠状态，配合 `(collapsedChange)` 做双向绑定。 */
  toggleCollapsed(): void {
    const next = !this.isCollapsed();
    this.innerCollapsed.set(next);
    this.collapsedChange.emit(next);
  }

  /** 选中某个菜单项。 */
  select(value: MenuValue | undefined): void {
    if (value === undefined || value === this.activeValue()) return;
    if (this.value() === undefined && this.modelValue() === undefined) {
      this.innerValue.set(value);
    }
    this.valueChange.emit(value);
    this.change.emit({ value });
  }

  /** 切换某个子菜单的展开状态，`expandMutex` 时收起同级其它子菜单。 */
  toggleExpand(value: MenuValue | undefined): void {
    if (value === undefined) return;
    const current = this.expandedValues();
    let next: MenuValue[];
    if (current.includes(value)) {
      next = current.filter((item) => item !== value);
    } else {
      const siblings = this.expandMutex() ? this.siblingValues(value) : [];
      next = [...current.filter((item) => !siblings.includes(item)), value];
    }
    this.setExpanded(next);
  }

  /** 上下键 / Home / End 在菜单项之间移动焦点。 */
  protected handleKeydown(event: KeyboardEvent): void {
    const keys = ['ArrowDown', 'ArrowUp', 'Home', 'End'];
    if (!keys.includes(event.key) || typeof document === 'undefined') return;
    const nodes = Array.from(
      this.elementRef.nativeElement.querySelectorAll<HTMLElement>('[data-t-menu-node]'),
    ).filter((node) => !node.hasAttribute('aria-disabled') && node.offsetParent !== null);
    if (!nodes.length) return;
    const currentIndex = nodes.indexOf(document.activeElement as HTMLElement);
    let nextIndex = currentIndex < 0 ? 0 : currentIndex;
    switch (event.key) {
      case 'ArrowDown':
        nextIndex = currentIndex < 0 ? 0 : (currentIndex + 1) % nodes.length;
        break;
      case 'ArrowUp':
        nextIndex = currentIndex < 0 ? nodes.length - 1 : (currentIndex - 1 + nodes.length) % nodes.length;
        break;
      case 'Home':
        nextIndex = 0;
        break;
      default:
        nextIndex = nodes.length - 1;
        break;
    }
    event.preventDefault();
    nodes[nextIndex]?.focus();
  }

  /** 富文本属性取出模板，供模板里的 `ngTemplateOutlet` 使用。 */
  protected readonly toTemplate = asTemplate;

  private setExpanded(next: MenuValue[]): void {
    if (this.expanded() === undefined) this.innerExpanded.set(next);
    this.expandedChange.emit(next);
    this.expand.emit(next);
  }

  private siblingValues(value: MenuValue): MenuValue[] {
    const nodes = this.flatNodes();
    const parent = nodes.find((item) => item.node.value() === value)?.parent;
    const siblings = nodes.filter(
      (item) => item.node.kind === 'submenu' && item.parent === parent,
    );
    return siblings
      .map((item) => item.node.value())
      .filter((item): item is MenuValue => item !== undefined && item !== value);
  }

  private formatWidth(value: string | number | undefined): string {
    if (typeof value === 'number') return `${value}px`;
    return value ?? '';
  }
}
