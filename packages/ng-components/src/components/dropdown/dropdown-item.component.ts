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
} from '@angular/core';
import {
  type DropdownContent,
  type DropdownItemClickEvent,
  type DropdownItemTheme,
  type DropdownValue,
} from './dropdown.types';

/** 把列宽换算成 CSS 长度：数字补 `px`，字符串原样（与上游 `pxCompat` 一致）。 */
function pxCompat(value: string | number): string {
  return typeof value === 'number' ? `${value}px` : value;
}

function isTemplate(value: unknown): value is TemplateRef<unknown> {
  return value instanceof TemplateRef;
}

/**
 * 下拉菜单选项。
 *
 * 作为 `t-dropdown` 的菜单项使用时由 `t-dropdown` 组装（内容由投影传入），
 * 也可以单独使用：`<t-dropdown-item content="选项一" />`。
 * 视觉样式全部来自 tdesign-common（`@tdesign-ng/styles`）。
 */
@Component({
  selector: 't-dropdown-item',
  standalone: true,
  imports: [NgTemplateOutlet],
  templateUrl: './dropdown-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class TDropdownItem {
  /** 是否高亮选中。 @zh 是否高亮选中 @en active @defaultValue false */
  readonly active = input(false, { transform: booleanAttribute });

  /** 选项内容，字符串按文本渲染，也可以传入模板，不传时使用投影内容。 @zh 选项内容 @en content @defaultValue undefined */
  readonly content = input<DropdownContent>(undefined);

  /** 是否禁用。 @zh 是否禁用 @en disabled @defaultValue false */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** 是否在选项下方渲染分割线；分割线由父级 `t-dropdown` 渲染，本组件不消费该输入。 @zh 是否显示分割线 @en divider @defaultValue false */
  readonly divider = input(false, { transform: booleanAttribute });

  /** 选项前置图标，字符串按文本渲染，也可以传入模板。 @zh 前置图标 @en prefix icon @defaultValue undefined */
  readonly prefixIcon = input<DropdownContent>(undefined);

  /** 选项主题色。 @zh 选项主题色 @en theme @defaultValue 'default' @values default,success,warning,error */
  readonly theme = input<DropdownItemTheme>('default');

  /** 选项值，点击时原样抛回。 @zh 选项值 @en value @defaultValue undefined */
  readonly value = input<DropdownValue>(undefined);

  /** 选项最大宽度，数字按 px 处理，由父级菜单下发。 @zh 选项最大宽度 @en max column width @defaultValue 100 @internal */
  readonly maxColumnWidth = input<string | number>(100);

  /** 选项最小宽度，数字按 px 处理，由父级菜单下发。 @zh 选项最小宽度 @en min column width @defaultValue 10 @internal */
  readonly minColumnWidth = input<string | number>(10);

  /** 是否作为子菜单的父项，为 true 时追加 `t-dropdown__item--suffix` 类。 @zh 是否含子菜单 @en has submenu @defaultValue false @internal */
  readonly hasSubmenu = input(false, { transform: booleanAttribute });

  /** 选项被点击，参数为 `{ value, e }`；禁用时不会触发。 @zh 点击选项 @en click */
  readonly click = output<DropdownItemClickEvent>();

  protected readonly classes = computed(() => {
    const classes = ['t-dropdown__item', `t-dropdown__item--theme-${this.theme()}`];
    if (this.active()) {
      classes.push('t-dropdown__item--active');
    }
    if (this.disabled()) {
      classes.push('t-dropdown__item--disabled');
    }
    if (this.hasSubmenu()) {
      classes.push('t-dropdown__item--suffix');
    }
    return classes.join(' ');
  });

  protected readonly itemStyle = computed(() => ({
    maxWidth: pxCompat(this.maxColumnWidth()),
    minWidth: pxCompat(this.minColumnWidth()),
  }));

  protected readonly prefixIconTemplate = computed(() => {
    const value = this.prefixIcon();
    return isTemplate(value) ? value : null;
  });

  protected readonly prefixIconText = computed(() => {
    const value = this.prefixIcon();
    return typeof value === 'string' ? value : '';
  });

  protected readonly contentTemplate = computed(() => {
    const value = this.content();
    return isTemplate(value) ? value : null;
  });

  protected readonly contentText = computed(() => {
    const value = this.content();
    return typeof value === 'string' ? value : '';
  });

  protected handleClick(event: MouseEvent): void {
    if (this.disabled()) {
      return;
    }
    this.click.emit({ value: this.value(), e: event });
  }
}
