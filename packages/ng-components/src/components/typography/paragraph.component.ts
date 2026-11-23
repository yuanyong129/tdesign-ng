import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input } from '@angular/core';
import {
  TypographyContent,
  TypographyEllipsis,
  asTemplateRef,
  typographyEllipsisStyle,
} from './typography.types';

/**
 * 段落。
 *
 * 渲染真实的 `<p class="t-typography">`，与 `.t-typography` 的 margin / font 规则对应。
 *
 * 宿主元素只是壳，`display: contents` 由 bridge.less 统一提供。
 */
@Component({
  selector: 't-paragraph',
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

    <p class="t-typography" [style]="ellipsisStyle()">
      <ng-container *ngTemplateOutlet="contentTpl" />
    </p>
  `,
})
export class TParagraph {
  /** 段落内容。 @zh 段落内容 @en content @defaultValue undefined */
  content = input<TypographyContent>(undefined);

  /** 省略配置，传 true 表示单行截断。 @zh 省略 @en ellipsis @defaultValue false */
  ellipsis = input<boolean | TypographyEllipsis>(false);

  /** 供模板判断 content 是不是模板引用。 */
  protected readonly asTemplate = asTemplateRef;

  protected readonly ellipsisStyle = computed(() => typographyEllipsisStyle(this.ellipsis()));
}
