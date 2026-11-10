import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  output,
} from '@angular/core';

/** 链接主题色。 */
export const LINK_THEMES = ['default', 'primary', 'danger', 'warning', 'success'] as const;
export type LinkTheme = (typeof LINK_THEMES)[number];

/** 链接尺寸。 */
export const LINK_SIZES = ['small', 'medium', 'large'] as const;
export type LinkSize = (typeof LINK_SIZES)[number];

/** 悬浮态效果。 */
export const LINK_HOVERS = ['color', 'underline'] as const;
export type LinkHover = (typeof LINK_HOVERS)[number];

/**
 * 链接。
 *
 * 视觉样式全部来自 tdesign-common（`@tdesign-ng/styles`）：基础类 `.t-link`，
 * 主题 `.t-link--theme-*`、悬浮 `.t-link--hover-*`、下划线 `.t-is-underline`、
 * 禁用 `.t-is-disabled`、尺寸 `.t-size-s` / `.t-size-l`（medium 无类名）。
 */
@Component({
  selector: 't-link',
  standalone: true,
  template: `
    @if (hasPrefixIcon()) {
      <span class="t-link__prefix-icon"><ng-content select="[tLinkPrefixIcon]" /></span>
    }
    <ng-content />
    @if (hasSuffixIcon()) {
      <span class="t-link__suffix-icon"><ng-content select="[tLinkSuffixIcon]" /></span>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'classes()',
    '[attr.href]': 'disabled() ? null : href() || null',
    '[attr.target]': 'target() || null',
    '[attr.download]': 'downloadAttr()',
    '[attr.aria-disabled]': 'disabled() ? "true" : null',
    '[attr.tabindex]': 'disabled() ? -1 : null',
    '(click)': 'handleClick($event)',
  },
})
export class TLink {
  /** 链接地址。 @zh 链接地址 @en href */
  href = input<string | undefined>(undefined);

  /** 跳转目标。 @zh 跳转目标 @en target */
  target = input<string | undefined>(undefined);

  /** 链接主题色。 @zh 主题色 @en theme @defaultValue default @values default,primary,danger,warning,success */
  theme = input<LinkTheme>('default');

  /** 链接尺寸。 @zh 尺寸 @en size @defaultValue medium @values small,medium,large */
  size = input<LinkSize>('medium');

  /** 是否显示下划线。 @zh 是否显示下划线 @en underline @defaultValue false */
  underline = input(false, { transform: booleanAttribute });

  /** 悬浮态效果。 @zh 悬浮态效果 @en hover @defaultValue underline @values color,underline */
  hover = input<LinkHover>('underline');

  /** 是否禁用。 @zh 是否禁用 @en disabled @defaultValue false */
  disabled = input(false, { transform: booleanAttribute });

  /** 下载文件名，传 true 表示按浏览器默认行为下载。 @zh 下载 @en download */
  download = input<string | boolean | undefined>(undefined);

  /** 是否带前缀图标（用于决定是否渲染包裹层）。 @zh 是否带前缀图标 @en hasPrefixIcon @defaultValue false */
  hasPrefixIcon = input(false, { transform: booleanAttribute });

  /** 是否带后缀图标（用于决定是否渲染包裹层）。 @zh 是否带后缀图标 @en hasSuffixIcon @defaultValue false */
  hasSuffixIcon = input(false, { transform: booleanAttribute });

  /** 点击事件，禁用时不会触发。 @zh 点击事件 @en click */
  click = output<MouseEvent>();

  protected readonly downloadAttr = computed(() => {
    const download = this.download();
    if (download === undefined || download === false) {
      return null;
    }
    return download === true ? '' : download;
  });

  protected readonly classes = computed(() => {
    const classes = ['t-link', `t-link--theme-${this.theme()}`, `t-link--hover-${this.hover()}`];
    if (this.underline()) {
      classes.push('t-is-underline');
    }
    if (this.disabled()) {
      classes.push('t-is-disabled');
    }
    const size = this.size();
    if (size === 'small') {
      classes.push('t-size-s');
    } else if (size === 'large') {
      classes.push('t-size-l');
    }
    return classes.join(' ');
  });

  protected handleClick(event: MouseEvent): void {
    if (this.disabled()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }
    this.click.emit(event);
  }
}
