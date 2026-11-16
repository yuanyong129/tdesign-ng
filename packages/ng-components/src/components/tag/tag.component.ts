import {
  AfterContentChecked,
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  output,
  signal,
  viewChild,
} from '@angular/core';
import {
  TAG_SIZES,
  TAG_THEMES,
  TAG_VARIANTS,
  TagShape,
  TagSize,
  TagTheme,
  TagVariant,
  colorLuminance,
} from './tag.types';

const SIZE_CLASS: Record<TagSize, string> = {
  small: 't-size-s',
  medium: '',
  large: 't-size-l',
};

/**
 * 标签。
 *
 * ```html
 * <t-tag theme="primary" variant="light">标签</t-tag>
 * <t-tag theme="danger" [closable]="true" (close)="handleClose()">可关闭</t-tag>
 * ```
 */
@Component({
  selector: 't-tag',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './tag.component.html',
})
export class TTag implements AfterContentChecked {
  /** @zh 标签文字 @en Tag content @defaultValue '' */
  readonly content = input('');

  /** @zh 标签主题 @en Tag theme @defaultValue 'default' @values default, primary, warning, danger, success */
  readonly theme = input<TagTheme>('default');

  /** @zh 标签变体 @en Tag variant @defaultValue 'dark' @values dark, light, outline, light-outline */
  readonly variant = input<TagVariant>('dark');

  /** @zh 标签形状 @en Tag shape @defaultValue 'square' @values square, round, mark */
  readonly shape = input<TagShape>('square');

  /** @zh 标签尺寸 @en Tag size @defaultValue 'medium' @values small, medium, large */
  readonly size = input<TagSize>('medium');

  /** @zh 是否可关闭 @en Whether the tag is closable @defaultValue false */
  readonly closable = input(false, { transform: booleanAttribute });

  /** @zh 是否禁用 @en Whether the tag is disabled @defaultValue false */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** @zh 文字最大宽度，超出省略 @en Max width of the text, truncated when exceeded @defaultValue undefined */
  readonly maxWidth = input<string | number | undefined>(undefined);

  /** @zh 自定义颜色，会按亮度自动选择文字颜色 @en Custom color, the text color is chosen by luminance @defaultValue undefined */
  readonly color = input<string | undefined>(undefined);

  /** @zh title 提示，false 关闭、true 使用文字内容 @en Title tooltip, false disables it and true uses the content @defaultValue undefined */
  readonly title = input<string | boolean | undefined>(undefined);

  /** @zh 关闭标签 @en Emitted when the close icon is clicked */
  readonly close = output<MouseEvent>();

  private readonly textRef = viewChild<ElementRef<HTMLElement>>('text');

  /** 投影内容的文字，供 [title]="true" 时作为提示。 */
  private readonly projectedText = signal('');

  protected readonly themes = TAG_THEMES;
  protected readonly variants = TAG_VARIANTS;

  protected readonly classes = computed(() =>
    [
      't-tag',
      `t-tag--${this.theme()}`,
      `t-tag--${this.variant()}`,
      this.maxWidth() !== undefined ? 't-tag--ellipsis' : '',
      this.closable() ? 't-tag--close' : '',
      this.disabled() ? 't-tag--disabled' : '',
      SIZE_CLASS[this.size()],
      this.shape() !== 'square' ? `t-tag--${this.shape()}` : '',
    ]
      .filter(Boolean)
      .join(' '),
  );

  protected readonly textClasses = computed(() => (this.maxWidth() !== undefined ? 't-tag--text' : null));

  protected readonly textStyle = computed(() => {
    const maxWidth = this.maxWidth();
    if (maxWidth === undefined) return null;
    return { maxWidth: typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth };
  });

  protected readonly customStyle = computed(() => {
    const color = this.color();
    if (!color) return null;

    const variant = this.variant();
    const style: Record<string, string> = {};
    const useDarkText = colorLuminance(color) > 0.5;

    if (variant === 'outline' || variant === 'light-outline') {
      style['border-color'] = color;
    }
    if (variant !== 'outline') {
      style['background-color'] = variant === 'dark' ? color : this.withAlpha(color, 0.1);
    }
    if (variant !== 'dark') {
      style['color'] = color;
    } else {
      style['color'] = useDarkText ? 'black' : 'white';
    }

    return style;
  });

  protected readonly titleAttr = computed(() => {
    const title = this.title();
    if (title === false) return null;
    if (title === true) return this.content() || this.projectedText() || null;
    return title ?? this.content() ?? this.projectedText() ?? null;
  });

  ngAfterContentChecked(): void {
    const text = this.textRef()?.nativeElement.textContent?.trim() ?? '';
    if (text !== this.projectedText()) this.projectedText.set(text);
  }

  protected handleClose(event: MouseEvent): void {
    event.stopPropagation();
    if (this.disabled()) return;
    this.close.emit(event);
  }

  private withAlpha(color: string, alpha: number): string {
    const rgb = color.trim();
    if (rgb.startsWith('#')) {
      const canvas = rgb.length === 4 ? `#${rgb[1]}${rgb[1]}${rgb[2]}${rgb[2]}${rgb[3]}${rgb[3]}` : rgb;
      const r = parseInt(canvas.slice(1, 3), 16);
      const g = parseInt(canvas.slice(3, 5), 16);
      const b = parseInt(canvas.slice(5, 7), 16);
      return `rgba(${r}, ${g}, ${b}, ${alpha})`;
    }
    if (rgb.startsWith('rgb')) {
      return rgb.replace(/^rgba?\(/, 'rgba(').replace(/\)$/, `, ${alpha})`);
    }
    return rgb;
  }
}
