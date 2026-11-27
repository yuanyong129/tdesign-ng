import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { AvatarShape, AvatarSize } from './avatar.types';
import { DomPortal } from '@angular/cdk/portal';
import type { AvatarContent, AvatarImageProps } from './avatar.types';
import { TImage } from '../image/image.component';
import type { ImageEvent } from '../image/image.component';
import { isTemplateContent } from '../../_utils/content';

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
  imports: [NgTemplateOutlet, TImage],
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

  /** @zh 图片配置，支持当前 AvatarImageProps 中的 Image 属性及回调，图片地址与 alt 以显式输入为准 @en Supported Image options and callbacks; image URL and alt are controlled by explicit avatar inputs @defaultValue undefined */
  readonly imageProps = input<AvatarImageProps | undefined>(undefined);

  /** @zh 图片的 alt 文本 @en Alt text of the image @defaultValue undefined */
  readonly alt = input<string | undefined>();

  /** @zh 头像形状 @en Avatar shape @defaultValue 'circle' @values circle, round, square */
  readonly shape = input<AvatarShape>('circle');

  /** @zh 头像尺寸，支持 small / medium / large 或具体数值 @en Avatar size, accepts small / medium / large or a concrete value @defaultValue 'medium' */
  readonly size = input<string>('medium');

  /** @zh 图片加载失败时是否隐藏图片并回退到头像内容 @en Whether to hide the failed image and render avatar content instead @defaultValue false */
  readonly hideOnLoadFailed = input(false, { transform: booleanAttribute });

  /** @zh 头像内容，支持字符串或模板，无图片或隐藏失败图片时显示 @en Avatar content as text or a template, shown without an image or when the failed image is hidden @defaultValue undefined */
  readonly content = input<AvatarContent>(undefined);

  /** @zh 图片加载失败 @en Emitted when the image fails to load */
  readonly error = output<Event>();

  private readonly imageFailed = signal(false);
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  protected readonly isTemplateContent = isTemplateContent;

  /** 头像组移动原宿主节点，保留原生宿主事件、投影和组件状态。 */
  readonly groupPortal = new DomPortal(this.element);

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

  protected readonly showImage = computed(() => !!this.image() && !(this.imageFailed() && this.hideOnLoadFailed()));

  constructor() {
    effect(() => {
      this.image();
      this.imageFailed.set(false);
    });
    inject(DestroyRef).onDestroy(() => {
      if (!this.groupPortal.isAttached) return;
      // 动态删除头像时，先解绑 Portal 再移除恢复到原位置的宿主，避免留下已销毁节点。
      this.groupPortal.detach();
      const element = this.element.nativeElement;
      element.parentNode?.removeChild(element);
    });
  }

  protected handleImageError(context: ImageEvent): void {
    this.imageFailed.set(true);
    this.error.emit(context.e);
    this.imageProps()?.onError?.(context);
  }

  protected handleImageLoad(context: ImageEvent): void {
    this.imageProps()?.onLoad?.(context);
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
