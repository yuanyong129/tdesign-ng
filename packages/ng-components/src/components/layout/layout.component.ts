import { InitialRender } from '../../_utils/initial-render';
import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  contentChildren,
  input,
} from '@angular/core';
import { cn } from '../../_utils';
import { TAside } from './aside.component';

/** 布局方向。 */
export const LAYOUT_DIRECTIONS = ['vertical', 'horizontal'] as const;
export type LayoutDirection = (typeof LAYOUT_DIRECTIONS)[number];

/**
 * 布局容器。
 *
 * 视觉样式全部来自 tdesign-common（`@tdesign-ng/styles`），组件只负责结构与修饰类。
 */
@Component({
  selector: 't-layout',
  hostDirectives: [InitialRender],
  standalone: true,
  template: `<ng-content />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'classes()',
  },
})
export class TLayout {
  /** 布局方向。未设置时按内容里是否包含 `t-aside` 自动判断。 @zh 布局方向 @en direction @values vertical,horizontal */
  direction = input<LayoutDirection | undefined>(undefined);

  private readonly asides = contentChildren(TAside);

  protected readonly classes = computed(() => {
    const direction = this.direction() ?? (this.asides().length ? 'horizontal' : 'vertical');
    return cn('t-layout', `t-layout__direction-${direction}`, {
      't-layout--with-sider': direction === 'horizontal' && this.asides().length > 0,
    });
  });
}
