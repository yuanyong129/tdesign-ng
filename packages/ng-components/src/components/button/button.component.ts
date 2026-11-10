import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  output,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import type { ButtonShape, ButtonSize, ButtonTheme, ButtonType, ButtonVariant } from './button.types';

const PREFIX_CLS = 't-button';

/**
 * 把上游的 variant/theme/shape/size 等维度翻译成 TDesign 的类名。
 * `rectangle` 与 `medium` 是默认值，不产生类名；`block` 使用 `t-size-full-width`。
 */
function buildClasses(options: {
  variant: ButtonVariant;
  theme: ButtonTheme;
  shape: ButtonShape;
  size: ButtonSize;
  block: boolean;
  ghost: boolean;
  disabled: boolean;
  loading: boolean;
}): string[] {
  const classes = [
    PREFIX_CLS,
    `${PREFIX_CLS}--variant-${options.variant}`,
    `${PREFIX_CLS}--theme-${options.theme}`,
  ];

  if (options.shape !== 'rectangle') classes.push(`${PREFIX_CLS}--shape-${options.shape}`);
  if (options.ghost) classes.push(`${PREFIX_CLS}--ghost`);
  if (options.size === 'small') classes.push('t-size-s');
  else if (options.size === 'large') classes.push('t-size-l');
  if (options.block) classes.push('t-size-full-width');
  if (options.loading) classes.push('t-is-loading');
  if (options.disabled) classes.push('t-is-disabled');

  return classes;
}

/**
 * 按钮。
 *
 * 用法与 TDesign 一致：
 * ```html
 * <t-button theme="primary">主要按钮</t-button>
 * <t-button variant="outline" theme="danger">危险按钮</t-button>
 * <t-button theme="primary" [loading]="true">加载中</t-button>
 * <t-button shape="square">
 *   <t-icon tButtonIcon name="add" />
 * </t-button>
 * ```
 *
 * 图标用 `tButtonIcon` 标记，尾部附加内容用 `tButtonSuffix` 标记，其余内容进入文字区。
 */
@Component({
  selector: 't-button',
  standalone: true,
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './button.component.html',
})
export class TButton {
  /** @zh 按钮变体 @en Button variant @defaultValue 'base' @values base outline dashed text */
  readonly variant = input<ButtonVariant>('base');

  /** @zh 按钮主题色 @en Button theme @defaultValue 'default' @values default primary danger warning success */
  readonly theme = input<ButtonTheme>('default');

  /** @zh 按钮形状 @en Button shape @defaultValue 'rectangle' @values rectangle square round circle */
  readonly shape = input<ButtonShape>('rectangle');

  /** @zh 按钮尺寸 @en Button size @defaultValue 'medium' @values small medium large */
  readonly size = input<ButtonSize>('medium');

  /** @zh 是否撑满父容器宽度 @en Whether the button fills its container @defaultValue false */
  readonly block = input(false, { transform: booleanAttribute });

  /** @zh 是否为幽灵按钮 @en Whether the button is a ghost button @defaultValue false */
  readonly ghost = input(false, { transform: booleanAttribute });

  /** @zh 是否禁用 @en Whether the button is disabled @defaultValue false */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** @zh 是否处于加载状态 @en Whether the button is in loading state @defaultValue false */
  readonly loading = input(false, { transform: booleanAttribute });

  /** @zh 渲染的标签，`a` 会渲染成链接 @en Tag to render, `a` renders a link @defaultValue 'button' @values button a div */
  readonly tag = input<'button' | 'a' | 'div'>('button');

  /** @zh 链接地址，设置后自动以 `a` 渲染 @en Link address, renders an `a` when set @defaultValue undefined */
  readonly href = input<string | undefined>(undefined);

  /** @zh 原生 button 的 type 属性 @en Native button type @defaultValue 'button' @values button submit reset */
  readonly type = input<ButtonType>('button');

  /** @zh 关联的表单 id @en Id of the associated form @defaultValue undefined */
  readonly form = input<string | undefined>(undefined);

  /** @zh 点击事件 @en Click event */
  readonly click = output<MouseEvent>();

  /** 加载中同样禁止再次点击，与上游行为一致。 */
  readonly mergedDisabled = computed(() => this.disabled() || this.loading());

  /** 设置 href 或 tag="a" 时渲染成链接。 */
  readonly isLink = computed(() => this.tag() === 'a' || !!this.href());

  readonly classes = computed(() =>
    buildClasses({
      variant: this.variant(),
      theme: this.theme(),
      shape: this.shape(),
      size: this.size(),
      block: this.block(),
      ghost: this.ghost(),
      disabled: this.mergedDisabled(),
      loading: this.loading(),
    }).join(' '),
  );

  handleClick(event: MouseEvent): void {
    if (this.mergedDisabled()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this.click.emit(event);
  }
}
