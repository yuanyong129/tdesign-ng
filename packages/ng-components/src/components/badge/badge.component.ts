import {
  AfterContentChecked,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  inject,
  input,
  signal,
  viewChild,
} from '@angular/core';
import { BADGE_SHAPES, BADGE_SIZES, BadgeShape, BadgeSize } from './badge.types';

/**
 * 徽标。
 *
 * ```html
 * <t-badge count="8"><t-button>消息</t-button></t-badge>
 * <t-badge [dot]="true"><t-button>红点</t-button></t-badge>
 * ```
 */
@Component({
  selector: 't-badge',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './badge.component.html',
})
export class TBadge implements AfterContentChecked {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  private readonly root = viewChild<ElementRef<HTMLElement>>('root');

  /** @zh 徽标内容，传字符串时直接显示 @en Badge content, a string is displayed as is @defaultValue undefined */
  readonly content = input<string | undefined>();

  /** @zh 徽标数字 @en Badge count @defaultValue undefined */
  readonly count = input<string | number | undefined>();

  /** @zh 封顶数字，超出显示 `${maxCount}+` @en Max count, shows `${maxCount}+` when exceeded @defaultValue 99 */
  readonly maxCount = input(99);

  /** @zh 是否显示为小红点 @en Whether to show a dot @defaultValue false */
  readonly dot = input(false, { transform: booleanAttribute });

  /** @zh 徽标形状 @en Badge shape @defaultValue 'circle' @values circle, round */
  readonly shape = input<BadgeShape>('circle');

  /** @zh 徽标尺寸 @en Badge size @defaultValue 'medium' @values small, medium */
  readonly size = input<BadgeSize>('medium');

  /** @zh 数字为 0 时是否显示 @en Whether to show the badge when the count is 0 @defaultValue false */
  readonly showZero = input(false, { transform: booleanAttribute });

  /** @zh 自定义背景色 @en Custom background color @defaultValue undefined */
  readonly color = input<string | undefined>();

  /** @zh 徽标偏移量，[x, y] @en Badge offset, [x, y] @defaultValue undefined */
  readonly offset = input<Array<string | number> | undefined>();

  protected readonly shapes = BADGE_SHAPES;
  protected readonly sizes = BADGE_SIZES;

  /** 没有子内容时徽标改为静态定位，避免挂在 0×0 的盒子上。 */
  protected readonly hasChild = signal(false);

  protected readonly displayCount = computed(() => {
    const count = this.count();
    if (count === undefined || count === null) return '';
    const max = this.maxCount();
    return Number(count) > max ? `${max}+` : String(count);
  });

  protected readonly hidden = computed(() => {
    if (this.dot()) return false;
    const value = this.displayCount();
    const empty = value === '' || value === '0' || value === '0+';
    return !this.showZero() && empty;
  });

  protected readonly badgeClasses = computed(() =>
    [
      this.shape() === 'circle' ? 't-badge--circle' : 't-badge--round',
      this.size() === 'small' ? 't-size-s' : '',
    ]
      .filter(Boolean)
      .join(' '),
  );

  protected readonly rootClasses = computed(() =>
    ['t-badge', this.hasChild() ? '' : 't-badge--static'].filter(Boolean).join(' '),
  );

  protected readonly badgeStyle = computed(() => {
    const style: Record<string, string> = {};
    const color = this.color();
    if (color) style['background'] = color;

    const offset = this.offset();
    if (offset) {
      const [x, y] = offset;
      if (x !== undefined && x !== '') style['right'] = this.toLength(x);
      if (y !== undefined && y !== '') style['top'] = this.toLength(y);
    }

    return Object.keys(style).length ? style : null;
  });

  ngAfterContentChecked(): void {
    const root = this.root()?.nativeElement;
    if (!root) return;
    // 子内容 + sup，超过 1 个说明有投影内容
    const hasChild = Array.from(root.children).some((child) => child.tagName.toLowerCase() !== 'sup');
    if (hasChild !== this.hasChild()) this.hasChild.set(hasChild);
  }

  private toLength(value: string | number): string {
    return typeof value === 'number' ? `${value}px` : value;
  }
}
