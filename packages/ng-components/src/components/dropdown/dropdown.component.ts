import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { TDivider } from '../divider/divider.component';
import { TPopup } from '../popup/popup.component';
import { TDropdownItem } from './dropdown-item.component';
import {
  type DropdownClickEvent,
  type DropdownContent,
  type DropdownDirection,
  type DropdownItemClickEvent,
  type DropdownOption,
  type DropdownPlacement,
  type DropdownTrigger,
} from './dropdown.types';

/**
 * 选项点击后延迟关闭的时间。
 * 上游由 `popupProps.delay + 10` 推导，默认 popup delay 为 150，因此这里是 160；
 * 同时弹层的 hover 关闭延迟也用 150（见 `popupDelay`），保证鼠标从触发器移到面板时不会被立刻关掉。
 */
const MANUAL_CLOSE_TIMEOUT = 160;

const POPUP_CLOSE_DELAY = 150;

function isTemplate(value: unknown): value is TemplateRef<unknown> {
  return value instanceof TemplateRef;
}

/**
 * 下拉菜单。
 *
 * 触发器由内容投影传入（第一个元素子节点会被 `t-popup` 当作定位锚点，
 * 因此要包一层有盒子的元素，`t-button` 这类组件宿主是 `display: contents`），
 * 面板由 `t-popup` 承载、在 `.t-popup__content` 上挂 `t-dropdown` 面板类，
 * 菜单项由 `t-dropdown-item` 渲染，视觉样式全部来自 tdesign-common（`@tdesign-ng/styles`）。
 *
 * ```html
 * <t-dropdown [options]="options" (click)="onClick($event)">
 *   <span><t-button>更多</t-button></span>
 * </t-dropdown>
 * ```
 */
@Component({
  selector: 't-dropdown',
  standalone: true,
  imports: [NgTemplateOutlet, TDivider, TDropdownItem, TPopup],
  templateUrl: './dropdown.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class TDropdown {
  /** 子菜单的展开方向。 @zh 子菜单展开方向 @en direction @defaultValue 'right' @values left,right */
  readonly direction = input<DropdownDirection>('right');

  /** 是否禁用整个下拉菜单。 @zh 是否禁用 @en disabled @defaultValue false */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** 点击选项后是否自动关闭菜单。 @zh 点击选项后是否关闭 @en hide after item click @defaultValue true */
  readonly hideAfterItemClick = input(true, { transform: booleanAttribute });

  /** 选项最大宽度，数字按 px 处理。 @zh 选项最大宽度 @en max column width @defaultValue 100 */
  readonly maxColumnWidth = input<string | number>(100);

  /** 菜单面板最大高度，单位 px，超出后面板滚动。 @zh 面板最大高度 @en max height @defaultValue 300 */
  readonly maxHeight = input<number>(300);

  /** 选项最小宽度，数字按 px 处理。 @zh 选项最小宽度 @en min column width @defaultValue 10 */
  readonly minColumnWidth = input<string | number>(10);

  /** 菜单选项，`children` 会渲染成子菜单。 @zh 菜单选项 @en options @defaultValue [] */
  readonly options = input<DropdownOption[]>([]);

  /** 面板底部内容，字符串按文本渲染，也可以传入模板。 @zh 面板底部内容 @en panel bottom content @defaultValue undefined */
  readonly panelBottomContent = input<DropdownContent>(undefined);

  /** 面板顶部内容，字符串按文本渲染，也可以传入模板。 @zh 面板顶部内容 @en panel top content @defaultValue undefined */
  readonly panelTopContent = input<DropdownContent>(undefined);

  /** 弹层位置。 @zh 弹层位置 @en popup placement @defaultValue 'bottom-left' @values top,left,right,bottom,top-left,top-right,bottom-left,bottom-right,left-top,left-bottom,right-top,right-bottom */
  readonly placement = input<DropdownPlacement>('bottom-left');

  /** 触发方式。 @zh 触发方式 @en trigger @defaultValue 'hover' @values hover,click,focus,context-menu */
  readonly trigger = input<DropdownTrigger>('hover');

  /** 点击菜单项，参数为 `{ item, e }`。 @zh 点击菜单项 @en click */
  readonly click = output<DropdownClickEvent>();

  /** 面板展开状态受 `t-popup` 控制，这里保存它回传的状态。 */
  protected readonly popupVisible = signal(false);

  /** 非子菜单的 hover 关闭延迟需要大于 0，否则鼠标移向面板的瞬间面板就被隐藏了。 */
  protected readonly popupDelay: [number, number] = [0, POPUP_CLOSE_DELAY];

  protected readonly menuClasses = computed(
    () => `t-dropdown__menu t-dropdown__menu--${this.direction()}`,
  );

  protected readonly submenuWrapperClasses = computed(
    () => `t-dropdown__submenu-wrapper t-dropdown__submenu-wrapper--${this.direction()}`,
  );

  protected readonly panelTopTemplate = computed(() => {
    const value = this.panelTopContent();
    return isTemplate(value) ? value : null;
  });

  protected readonly panelTopText = computed(() => {
    const value = this.panelTopContent();
    return typeof value === 'string' ? value : '';
  });

  protected readonly panelBottomTemplate = computed(() => {
    const value = this.panelBottomContent();
    return isTemplate(value) ? value : null;
  });

  protected readonly panelBottomText = computed(() => {
    const value = this.panelBottomContent();
    return typeof value === 'string' ? value : '';
  });

  protected asTemplate(value: DropdownContent): TemplateRef<unknown> | null {
    return isTemplate(value) ? value : null;
  }

  protected submenuClasses(item: DropdownOption): string {
    const classes = ['t-dropdown__submenu'];
    if (item.disabled) {
      classes.push('t-dropdown__submenu--disabled');
    }
    return classes.join(' ');
  }

  protected handlePopupVisibleChange(visible: boolean): void {
    this.popupVisible.set(visible);
  }

  /** 与上游 `handleMenuClick` 一致：先跑选项自身的 `onClick`，再按需延迟关闭，最后抛出组件事件。 */
  protected handleItemClick(item: DropdownOption, event: DropdownItemClickEvent): void {
    item.onClick?.(item.value, { e: event.e });

    if (this.hideAfterItemClick()) {
      setTimeout(() => this.popupVisible.set(false), MANUAL_CLOSE_TIMEOUT);
    }

    this.click.emit({ item, e: event.e });
  }

  /**
   * 子菜单用绝对定位跟随父项：`.t-dropdown__item:hover > div > div` 只负责显示，
   * 纵向位置按父项相对定位祖先（`.t-dropdown` 或上层 `.t-dropdown__submenu`）的偏移实时写入，
   * 这样滚动面板后也不会错位（`getBoundingClientRect` 已包含滚动量）。
   */
  protected handleSubmenuEnter(event: Event): void {
    const host = event.currentTarget as HTMLElement | null;
    const item = host?.querySelector<HTMLElement>('.t-dropdown__item');
    const wrapper = item?.querySelector<HTMLElement>('.t-dropdown__submenu-wrapper');
    if (!item || !wrapper) return;

    const base = (wrapper.offsetParent as HTMLElement | null) ?? item.closest<HTMLElement>('.t-dropdown');
    if (!base) return;

    wrapper.style.top = `${item.getBoundingClientRect().top - base.getBoundingClientRect().top}px`;
  }
}
