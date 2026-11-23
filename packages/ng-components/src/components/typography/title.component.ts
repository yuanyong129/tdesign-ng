import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input } from '@angular/core';
import {
  TypographyContent,
  TypographyEllipsis,
  TypographyLevel,
  asTemplateRef,
  typographyEllipsisStyle,
} from './typography.types';

/**
 * 标题。
 *
 * `level` 直接决定渲染的原生标签名（h1 ~ h6），因为 `.t-typography` 的标题字号与
 * 上下间距是 `h1&` 这类元素限定选择器，只写在类上不会生效。
 *
 * 宿主元素只是壳，`display: contents` 由 bridge.less 统一提供。
 */
@Component({
  selector: 't-title',
  standalone: true,
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <ng-template #contentTpl>
      @if (asTemplate(content()); as template) {
        <ng-container *ngTemplateOutlet="template" />
      } @else if (content()) {
        {{ content() }}
      } @else {
        <ng-content />
      }
    </ng-template>

    @switch (level()) {
      @case ('h1') {
        <h1 class="t-typography" [style]="ellipsisStyle()"><ng-container *ngTemplateOutlet="contentTpl" /></h1>
      }
      @case ('h2') {
        <h2 class="t-typography" [style]="ellipsisStyle()"><ng-container *ngTemplateOutlet="contentTpl" /></h2>
      }
      @case ('h3') {
        <h3 class="t-typography" [style]="ellipsisStyle()"><ng-container *ngTemplateOutlet="contentTpl" /></h3>
      }
      @case ('h4') {
        <h4 class="t-typography" [style]="ellipsisStyle()"><ng-container *ngTemplateOutlet="contentTpl" /></h4>
      }
      @case ('h5') {
        <h5 class="t-typography" [style]="ellipsisStyle()"><ng-container *ngTemplateOutlet="contentTpl" /></h5>
      }
      @case ('h6') {
        <h6 class="t-typography" [style]="ellipsisStyle()"><ng-container *ngTemplateOutlet="contentTpl" /></h6>
      }
    }
  `,
})
export class TTitle {
  /** 标题内容。 @zh 标题内容 @en content @defaultValue undefined */
  content = input<TypographyContent>(undefined);

  /** 省略配置，传 true 表示单行截断。 @zh 省略 @en ellipsis @defaultValue false */
  ellipsis = input<boolean | TypographyEllipsis>(false);

  /** 标题层级。 @zh 层级 @en level @defaultValue h1 @values h1,h2,h3,h4,h5,h6 */
  level = input<TypographyLevel>('h1');

  /** 供模板判断 content 是不是模板引用。 */
  protected readonly asTemplate = asTemplateRef;

  protected readonly ellipsisStyle = computed(() => typographyEllipsisStyle(this.ellipsis()));
}
