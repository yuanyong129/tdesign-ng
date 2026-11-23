import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input } from '@angular/core';

/**
 * 布局顶部栏。
 *
 * 视觉样式全部来自 tdesign-common（`@tdesign-ng/styles`），组件只负责结构与修饰类。
 */
@Component({
  selector: 't-header',
  standalone: true,
  template: `<ng-content />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 't-layout__header',
    '[style]': 'hostStyle()',
  },
})
export class THeader {
  /**
   * 顶部栏高度，缺省使用主题里的默认高度。
   * @zh 高度 @en height
   */
  height = input<string | undefined>(undefined);

  protected readonly hostStyle = computed(() => {
    const height = this.height();
    return height ? { height } : null;
  });
}
