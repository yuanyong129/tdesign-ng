import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  afterNextRender,
  inject,
  input,
  numberAttribute,
  signal,
} from '@angular/core';
import type { DescriptionsContent } from './descriptions.types';

/**
 * 描述列表项。
 *
 * 本身不渲染任何可见 DOM：`t-descriptions` 通过 `contentChildren` 收集所有项，再按
 * `layout` / `column` 统一算出表格行列并渲染 `t-descriptions__label` /
 * `t-descriptions__content` 单元格。
 *
 * 内容有两种写法：`content` 输入（字符串或模板，模板才能承载富文本），或直接写在元素里的
 * 纯文本（对齐上游默认插槽，首次渲染后读一次文本作为兜底）。
 */
@Component({
  selector: 't-descriptions-item',
  standalone: true,
  template: `<ng-content />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  // 本组件只承载数据、不参与视觉渲染：单元格由 t-descriptions 统一渲染，
  // 这里必须隐藏宿主，否则写进元素里的纯文本会在表格外再显示一份。
  host: {
    style: 'display: none',
  },
})
export class TDescriptionItem {
  /** 标签。 @zh 标签 @en label */
  readonly label = input<DescriptionsContent>(undefined);

  /** 内容，字符串按文本渲染，模板交给 `*ngTemplateOutlet`。 @zh 内容 @en content */
  readonly content = input<DescriptionsContent>(undefined);

  /** 占用的列数，仅 `layout` 为 horizontal 时生效。 @zh 占用的列数 @en span @defaultValue 1 */
  readonly span = input(1, { transform: numberAttribute });

  /**
   * 直接写在元素里的文本，作为 `content` 的兜底（对齐上游默认插槽）。
   *
   * 元素内只会取文本：写在里面的组件不会被渲染，富文本请通过 `content` 输入传模板。
   */
  readonly projectedText = signal('');

  private readonly hostEl = inject<ElementRef<HTMLElement>>(ElementRef);

  constructor() {
    // 首次渲染后读一次投影文本，做法同 t-divider 的文字探测。
    afterNextRender(() => this.projectedText.set(this.hostEl.nativeElement.textContent?.trim() ?? ''));
  }
}
