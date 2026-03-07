import { Component, Input, Output, computed, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonTypes } from './button.types';
import { BorderShape, Status, Size } from '../../_utils/constant';
import { getPrefixCls } from '../../_utils/global-config';
import { isString } from '../../_utils';
import { ArcoButtonGroup, ARCO_BUTTON_GROUP } from './button-group.component';

@Component({
  selector: 'a-button',
  template: `
    <a *ngIf="href" [class]="cls()" [href]="href">
      <ng-content></ng-content>
    </a>
    <button
      *ngIf="!href"
      [class]="cls()"
      [type]="htmlType"
      [disabled]="disabled || loading"
      [autofocus]="autofocus"
      (click)="handleClick($event)"
    >
      <ng-content></ng-content>
    </button>
  `,
  styleUrls: ['./styles/index.less'],
  standalone: true,
  imports: [CommonModule],
})
export class ArcoButton {
  /**
   * @zh 按钮的类型，分为五种：次要按钮、主要按钮、虚框按钮、线性按钮、文字按钮。
   * @en Button types are divided into five types: secondary, primary, dashed, outline and text.
   * @defaultValue 'secondary'
   */
  @Input() type?: ButtonTypes;
  /**
   * @zh 按钮的形状
   * @en Button shape
   */
  @Input() shape?: BorderShape;
  /**
   * @zh 按钮的状态
   * @en Button state
   * @values 'normal','warning','success','danger'
   * @defaultValue 'normal'
   */
  @Input() status?: Status;
  /**
   * @zh 按钮的尺寸
   * @en Button size
   * @values 'mini','small','medium','large'
   * @defaultValue 'medium'
   */
  @Input() size: Size = 'medium';
  /**
   * @zh 按钮的宽度是否随容器自适应。
   * @en Whether the width of the button adapts to the container.
   */
  @Input() long = false;
  /**
   * @zh 按钮是否为加载中状态
   * @en Whether the button is in the loading state
   */
  @Input() loading = false;
  /**
   * @zh 按钮是否禁用
   * @en Whether the button is disabled
   * @defaultValue false
   */
  @Input() disabled?: boolean;
  /**
   * @zh 设置 `button` 的原生 `type` 属性，可选值参考 [HTML标准](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#attr-type "_blank")
   * @en Set the native `type` attribute of `button`, optional values refer to [HTML](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#attr-type "_blank")
   */
  @Input() htmlType: HTMLButtonElement['type'] = 'button';
  /**
   * @zh 设置 `button` 的原生 `autofocus` 属性，可选值参考 [HTML标准](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#attr-type "_blank")
   * @en Set the native `autofocus` attribute of `button`, optional values refer to [HTML](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/button#attr-type "_blank")
   */
  @Input() autofocus: boolean = false;
  /**
   * @zh 设置跳转链接。设置此属性时，按钮渲染为a标签。
   * @en Set up a jump link. When this property is set, the button is rendered as `<a>`
   */
  @Input() href?: string;

  @Output() click = new EventEmitter<MouseEvent>();

  groupContext: ArcoButtonGroup | null;

  constructor() {
    const group = inject<ArcoButtonGroup>(ARCO_BUTTON_GROUP, { optional: true });
    this.groupContext = group;
  }

  mergedSize = computed(() => {
    return this.size ?? this.groupContext?.size ?? 'medium';
  });

  mergedDisabled = computed(() => {
    return this.disabled ?? this.groupContext?.disabled ?? false;
  });

  cls = computed(() => {
    const prefixCls = getPrefixCls('btn');
    return [
      prefixCls,
      `${prefixCls}-${this.type ?? this.groupContext?.type ?? 'secondary'}`,
      `${prefixCls}-shape-${this.shape ?? this.groupContext?.shape ?? 'square'}`,
      `${prefixCls}-size-${this.mergedSize()}`,
      `${prefixCls}-status-${this.status ?? this.groupContext?.status ?? 'normal'}`,
      this.long ? `${prefixCls}-long` : '',
      this.loading ? `${prefixCls}-loading` : '',
      this.mergedDisabled() ? `${prefixCls}-disabled` : '',
      isString(this.href) ? `${prefixCls}-link` : '',
    ];
  });

  handleClick(event: MouseEvent): void {
    if (!this.disabled && !this.loading) {
      this.click.emit(event);
    }
  }
}
