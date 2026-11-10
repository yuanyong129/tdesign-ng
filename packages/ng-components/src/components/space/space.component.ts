import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
} from '@angular/core';

/** 间距方向。 */
export const SPACE_DIRECTIONS = ['horizontal', 'vertical'] as const;
export type SpaceDirection = (typeof SPACE_DIRECTIONS)[number];

/** 交叉轴对齐方式。 */
export const SPACE_ALIGNS = ['start', 'end', 'center', 'baseline'] as const;
export type SpaceAlign = (typeof SPACE_ALIGNS)[number];

/** 预设间距尺寸。 */
export const SPACE_SIZES = ['small', 'medium', 'large'] as const;
export type SpaceSizeEnum = (typeof SPACE_SIZES)[number];

/** 间距大小：预设尺寸、数字（px）或任意 CSS 长度，也可以传数组表示 [水平, 垂直]。 */
export type SpaceSize = number | string | SpaceSizeEnum | Array<number | string | SpaceSizeEnum>;

const SIZE_MAP: Record<SpaceSizeEnum, string> = {
  small: '8px',
  medium: '16px',
  large: '24px',
};

function toLength(size: number | string): string {
  if (typeof size === 'number') {
    return `${size}px`;
  }
  return (SIZE_MAP as Record<string, string>)[size] ?? size;
}

/**
 * 间距。
 *
 * 视觉样式来自 tdesign-common（`@tdesign-ng/styles`）：`.t-space`、
 * `.t-space-<direction>`、`.t-space-align-*`、`.t-space--break-line`。
 *
 * 间距用 flex `gap` 实现（等价于上游的 `--td-space-column-gap` / `--td-space-row-gap`），
 * 不依赖 polyfill 修饰类。
 *
 * `separator` 目前支持字符串（作为 CSS `content` 注入），组件/模板分隔符暂不支持：
 * Angular 的内容投影无法在相邻插槽之间插入额外节点。
 */
@Component({
  selector: 't-space',
  standalone: true,
  template: `<ng-content />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'classes()',
    '[style]': 'hostStyle()',
  },
})
export class TSpace {
  /** 间距方向。 @zh 间距方向 @en direction @defaultValue horizontal @values horizontal,vertical */
  direction = input<SpaceDirection>('horizontal');

  /** 间距大小，支持预设值、数字或 CSS 长度，数组表示 [水平, 垂直]。 @zh 间距大小 @en size @defaultValue medium @values small,medium,large */
  size = input<SpaceSize>('medium');

  /** 交叉轴对齐方式。 @zh 交叉轴对齐 @en align @values start,end,center,baseline */
  align = input<SpaceAlign | undefined>(undefined);

  /** 是否自动换行（仅水平方向有效）。 @zh 是否自动换行 @en breakLine @defaultValue false */
  breakLine = input(false, { transform: booleanAttribute });

  /** 分隔符，仅支持字符串。 @zh 分隔符 @en separator */
  separator = input<string | undefined>(undefined);

  protected readonly classes = computed(() => {
    const classes = ['t-space', `t-space-${this.direction()}`];
    const align = this.align();
    if (align) {
      classes.push(`t-space-align-${align}`);
    }
    if (this.direction() === 'horizontal' && this.breakLine()) {
      classes.push('t-space--break-line');
    }
    if (this.separator()) {
      classes.push('t-space--separator');
    }
    return classes.join(' ');
  });

  protected readonly hostStyle = computed(() => {
    const size = this.size();
    const separator = this.separator();
    const styles: string[] = [];
    if (Array.isArray(size)) {
      const [column = size[0], row = size[0]] = size;
      styles.push(`column-gap: ${toLength(column ?? '16px')}`, `row-gap: ${toLength(row ?? '16px')}`);
    } else {
      styles.push(`gap: ${toLength(size)}`);
    }
    if (separator) {
      styles.push(`--td-space-separator: "${separator.replace(/"/g, '\\"')}"`);
    }
    return styles.join('; ');
  });
}
