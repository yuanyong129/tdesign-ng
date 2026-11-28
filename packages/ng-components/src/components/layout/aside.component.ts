import { InitialRender } from '../../_utils/initial-render';
import { ChangeDetectionStrategy, Component, ViewEncapsulation, computed, input } from '@angular/core';

/**
 * 布局侧边栏。
 *
 * 视觉样式全部来自 tdesign-common（`@tdesign-ng/styles`），组件只负责结构与修饰类。
 */
@Component({
  selector: 't-aside',
  hostDirectives: [InitialRender],
  standalone: true,
  template: `<ng-content />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    class: 't-layout__sider',
    '[style]': 'hostStyle()',
  },
})
export class TAside {
  /**
   * 侧边栏宽度，缺省使用主题里的默认宽度。
   * @zh 宽度 @en width
   */
  width = input<string | undefined>(undefined);

  protected readonly hostStyle = computed(() => {
    const width = this.width();
    return width ? { width } : null;
  });
}
