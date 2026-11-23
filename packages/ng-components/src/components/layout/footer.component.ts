import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input } from '@angular/core';

/**
 * 布局底部栏。
 *
 * 视觉样式全部来自 tdesign-common（`@tdesign-ng/styles`），组件只负责结构与修饰类。
 */
@Component({
  selector: 't-footer',
  standalone: true,
  template: `<ng-content />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 't-layout__footer',
    '[style]': 'hostStyle()',
  },
})
export class TFooter {
  /**
   * 底部栏高度，缺省按内容高度自适应。
   * @zh 高度 @en height
   */
  height = input<string | undefined>(undefined);

  protected readonly hostStyle = computed(() => {
    const height = this.height();
    return height ? { height } : null;
  });
}
