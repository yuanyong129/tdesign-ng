import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { AVATAR_SIZES, AvatarShape, AvatarSize } from './avatar.types';

const SIZE_CLASS: Record<AvatarSize, string> = {
  small: 't-size-s',
  medium: '',
  large: 't-size-l',
};

/**
 * 头像。
 *
 * ```html
 * <t-avatar image="https://example.com/a.png" alt="张三" />
 * <t-avatar content="张" [size]="'40px'" />
 * <t-avatar>
 *   <t-icon tAvatarIcon name="user" />
 * </t-avatar>
 * ```
 */
@Component({
  selector: 't-avatar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './avatar.component.html',
  host: {
    '[class.t-avatar--hidden]': 'groupHidden()',
  },
})
export class TAvatar {
  /** @zh 图片地址 @en Image URL @defaultValue undefined */
  readonly image = input<string | undefined>();

  /** @zh 图片的 alt 文本 @en Alt text of the image @defaultValue undefined */
  readonly alt = input<string | undefined>();

  /** @zh 头像形状 @en Avatar shape @defaultValue 'circle' @values circle, round, square */
  readonly shape = input<AvatarShape>('circle');

  /** @zh 头像尺寸，支持 small / medium / large 或具体数值 @en Avatar size, accepts small / medium / large or a concrete value @defaultValue 'medium' */
  readonly size = input<string>('medium');

  /** @zh 图片加载失败时是否隐藏 @en Whether to hide the avatar when the image fails to load @defaultValue false */
  readonly hideOnLoadFailed = input(false, { transform: booleanAttribute });

  /** @zh 头像文字，图片不可用时作为降级内容 @en Avatar text, used as fallback when the image is unavailable @defaultValue undefined */
  readonly content = input<string | undefined>();

  /** @zh 图片加载失败 @en Emitted when the image fails to load */
  readonly error = output<Event>();

  private readonly imageFailed = signal(false);

  protected readonly groupHidden = signal(false);

  protected readonly groupSize = signal<string | undefined>(undefined);

  protected readonly effectiveSize = computed(() => this.groupSize() ?? this.size());

  /** 自定义尺寸（数字或带单位）直接写行内样式，预设尺寸用类名。 */
  protected readonly customSize = computed(() => {
    const size = this.effectiveSize();
    if (size === 'small' || size === 'medium' || size === 'large') return null;
    return { width: this.toLength(size), height: this.toLength(size) };
  });

  protected readonly classes = computed(() =>
    [
      't-avatar',
      this.shape() === 'circle' ? 't-avatar--circle' : '',
      this.shape() === 'round' ? 't-avatar--round' : '',
      this.presetSizeClass(),
    ]
      .filter(Boolean)
      .join(' '),
  );

  protected readonly showImage = computed(() => !!this.image() && !this.imageFailed());

  protected handleImageError(event: Event): void {
    this.imageFailed.set(true);
    this.error.emit(event);
  }

  /** 由头像组调用，控制超出 max 的项是否隐藏。 */
  setGroupHidden(hidden: boolean): void {
    if (hidden !== this.groupHidden()) this.groupHidden.set(hidden);
  }

  /** 由头像组调用，统一下发尺寸。 */
  setGroupSize(size: string | undefined): void {
    if (size !== this.groupSize()) this.groupSize.set(size);
  }

  private presetSizeClass(): string {
    const size = this.effectiveSize();
    if (size === 'small' || size === 'medium' || size === 'large') return SIZE_CLASS[size];
    return '';
  }

  private toLength(value: string): string {
    return /^\d+(\.\d+)?$/.test(value) ? `${value}px` : value;
  }
}
