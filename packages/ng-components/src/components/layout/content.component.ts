import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

/**
 * 布局内容区。
 *
 * 视觉样式全部来自 tdesign-common（`@tdesign-ng/styles`），组件只负责结构与修饰类。
 */
@Component({
  selector: 't-content',
  standalone: true,
  template: `<ng-content />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 't-layout__content',
  },
})
export class TContent {}
