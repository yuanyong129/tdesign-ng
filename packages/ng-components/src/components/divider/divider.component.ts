import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  inject,
  input,
} from '@angular/core';

/** 分割线方向。 */
export const DIVIDER_LAYOUTS = ['horizontal', 'vertical'] as const;
export type DividerLayout = (typeof DIVIDER_LAYOUTS)[number];

/** 分割线文字位置。 */
export const DIVIDER_ALIGNS = ['left', 'right', 'center'] as const;
export type DividerAlign = (typeof DIVIDER_ALIGNS)[number];

/**
 * 分割线。
 *
 * 视觉样式全部来自 tdesign-common（`@tdesign-ng/styles`），组件只负责结构与修饰类。
 */
@Component({
  selector: 't-divider',
  standalone: true,
  template: `<div class="t-divider__inner-text"><ng-content /></div>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'classes()',
    '[style]': 'hostStyle()',
  },
})
export class TDivider implements AfterContentInit {
  /** 分割线方向。 @zh 方向 @en layout @defaultValue horizontal @values horizontal,vertical */
  layout = input<DividerLayout>('horizontal');

  /** 是否为虚线。 @zh 是否为虚线 @en dashed @defaultValue false */
  dashed = input(false, { transform: booleanAttribute });

  /** 文字位置。 @zh 文字位置 @en align @defaultValue center @values left,right,center */
  align = input<DividerAlign>('center');

  /**
   * 间距，横向分割线表示上下间距，纵向分割线表示左右间距。
   * @zh 间距 @en size
   */
  size = input<string | number | undefined>(undefined);

  private readonly hostEl = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly classes = computed(() => {
    const classes = ['t-divider', `t-divider--${this.layout()}`];
    if (this.dashed()) {
      classes.push('t-divider--dashed');
    }
    return classes.join(' ');
  });

  protected readonly hostStyle = computed(() => {
    const size = this.size();
    if (size === undefined || size === '') {
      return null;
    }
    const value = typeof size === 'number' ? `${size}px` : size;
    return this.layout() === 'vertical' ? `margin: 0 ${value};` : `margin: ${value} 0;`;
  });

  /**
   * 有文字内容时补 `with-text` 修饰类。
   *
   * Angular 的内容投影无法在模板里判断插槽是否为空，因此这里在内容初始化后读一次
   * 投影文本，命中就补类。上游 `.t-divider--with-text` 会把 border-top 去掉并改为
   * flex 布局，文字居中显示。
   */
  ngAfterContentInit(): void {
    if (this.layout() !== 'horizontal') {
      return;
    }
    const innerText = this.hostEl.nativeElement.querySelector('.t-divider__inner-text');
    if (!innerText || !innerText.textContent?.trim()) {
      return;
    }
    const classList = this.hostEl.nativeElement.classList;
    classList.add('t-divider--with-text', `t-divider--with-text-${this.align()}`);
  }
}
