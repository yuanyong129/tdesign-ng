import {
  ChangeDetectionStrategy,
  Component,
  InjectionToken,
  ViewEncapsulation,
  computed,
  forwardRef,
  inject,
  input,
} from '@angular/core';
import { TViewportService, cn } from '../../_utils';
import { RowAlign, RowGutter, RowJustify, resolveRowGutter, toRowGutter } from './grid.types';

/** 供 `t-col` 读取父级 `t-row` 的间距，Angular 组件无法像 Vue 那样用 `provide/inject` 的字符串 key。 */
export const T_ROW = new InjectionToken<TRow>('T_ROW');

/** 垂直对齐值到样式类后缀的映射（`start/end/center` 只对应 `--align-*` 形式，避免和 `--start` 的水平排列类冲突）。 */
function alignClass(align: RowAlign | undefined): string | null {
  if (!align) {
    return null;
  }
  if (align === 'top' || align === 'middle' || align === 'bottom') {
    return `t-row--${align}`;
  }
  return `t-row--align-${align}`;
}

/**
 * 栅格行。
 *
 * 视觉样式全部来自 tdesign-common（`@tdesign-ng/styles`），组件只负责结构与修饰类；
 * gutter 在样式表里没有对应规则，由行负外边距 + 列内边距实现。
 */
@Component({
  selector: 't-row',
  standalone: true,
  template: `<ng-content />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'classes()',
    '[style]': 'hostStyle()',
  },
  providers: [{ provide: T_ROW, useExisting: forwardRef(() => TRow) }],
})
export class TRow {
  private readonly viewport = inject(TViewportService);

  /** 水平排列方式。 @zh 水平排列方式 @en justify @values start,end,center,space-around,space-between */
  justify = input<RowJustify | undefined>(undefined);

  /** 垂直对齐方式。 @zh 垂直对齐方式 @en align @values start,end,center,stretch,baseline,top,middle,bottom */
  align = input<RowAlign | undefined>(undefined);

  /**
   * 栅格间距，支持数字、`[水平间距, 垂直间距]` 与按断点配置的对象。
   * @zh 栅格间距 @en gutter @defaultValue 0
   */
  gutter = input<RowGutter, unknown>(0, { transform: toRowGutter });

  private readonly gutterPair = computed(() =>
    resolveRowGutter(this.gutter(), this.viewport.breakpoint()),
  );

  /** 水平间距，供 `t-col` 计算左右内边距。 */
  readonly horizontalGutter = computed(() => this.gutterPair().horizontal);

  protected readonly classes = computed(() =>
    cn('t-row', this.justify() ? `t-row--${this.justify()}` : null, alignClass(this.align())),
  );

  protected readonly hostStyle = computed(() => {
    const { horizontal, vertical } = this.gutterPair();
    if (!horizontal && !vertical) {
      return null;
    }
    const style: Record<string, string> = {};
    if (horizontal) {
      const offset = `${horizontal / 2}px`;
      style['marginLeft'] = `-${offset}`;
      style['marginRight'] = `-${offset}`;
    }
    if (vertical) {
      style['rowGap'] = `${vertical}px`;
    }
    return style;
  });
}
