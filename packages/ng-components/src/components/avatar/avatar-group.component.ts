import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  contentChildren,
  effect,
  input,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { TAvatar } from './avatar.component';
import { AvatarCascading } from './avatar.types';
import type { AvatarContent } from './avatar.types';
import { PortalModule } from '@angular/cdk/portal';
import { TPopup } from '../popup/popup.component';
import { mergePopupOptions } from '../popup/popup.types';
import type { PopupOptions } from '../popup/popup.types';

/**
 * 头像组。
 *
 * ```html
 * <t-avatar-group [max]="3">
 *   <t-avatar content="A" />
 *   <t-avatar content="B" />
 * </t-avatar-group>
 * ```
 */
@Component({
  selector: 't-avatar-group',
  standalone: true,
  imports: [TAvatar, PortalModule, TPopup],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './avatar-group.component.html',
})
export class TAvatarGroup {
  /** @zh 最多显示的头像个数，正数时超出显示 +N，未设置或非正数时全部显示 @en Max visible avatars for positive values; unset or non-positive values show all avatars @defaultValue undefined */
  readonly max = input<number | undefined>(undefined);

  /** @zh 层叠方向 @en Cascading direction @defaultValue 'right-up' @values left-up, right-up */
  readonly cascading = input<AvatarCascading>('right-up');

  /** @zh 折叠头像内容，支持字符串或模板，默认 +N @en Content of the collapse avatar as text or a template, defaults to +N @defaultValue undefined */
  readonly collapseAvatar = input<AvatarContent>(undefined);

  /** @zh 折叠头像列表的弹层配置，支持当前 PopupOptions @en Supported popup options for the collapsed avatar list @defaultValue undefined */
  readonly popupProps = input<PopupOptions | undefined>(undefined);

  /** @zh 统一尺寸，会下发给组内所有头像 @en Size applied to all avatars in the group @defaultValue undefined */
  readonly size = input<string | undefined>(undefined);

  private readonly avatars = contentChildren(TAvatar);
  private readonly popup = viewChild<TPopup>('popup');
  protected readonly popupVisible = signal(false);
  protected readonly popupOptions = computed(() => mergePopupOptions(
    { placement: 'top', trigger: 'hover', delay: [0, 100], hideEmptyPopup: true }, this.popupProps(),
  ));

  private readonly visibleLimit = computed(() => {
    const max = this.max();
    return max !== undefined && Number.isFinite(max) && max > 0 ? Math.floor(max) : this.avatars().length;
  });
  protected readonly visibleAvatars = computed(() => this.avatars().slice(0, this.visibleLimit()));
  protected readonly collapsedAvatars = computed(() => this.avatars().slice(this.visibleLimit()));

  protected readonly classes = computed(() =>
    ['t-avatar-group', this.cascading() === 'right-up' ? 't-avatar--offset-right' : 't-avatar--offset-left']
      .filter(Boolean)
      .join(' '),
  );

  protected readonly collapsedCount = computed(() => this.collapsedAvatars().length);

  protected readonly collapseText = computed(
    () => this.collapseAvatar() ?? (this.collapsedCount() > 0 ? `+${this.collapsedCount()}` : ''),
  );

  constructor() {
    effect((onCleanup) => {
      const avatars = this.avatars();
      const limit = this.visibleLimit();
      const size = this.size();
      untracked(() => avatars.forEach((avatar, index) => {
        avatar.setGroupHidden(index >= limit);
        avatar.setGroupSize(size);
      }));
      onCleanup(() => untracked(() => avatars.forEach((avatar) => {
        avatar.setGroupHidden(false);
        avatar.setGroupSize(undefined);
      })));
    });
    effect(() => {
      if (!this.collapsedCount() || this.popupOptions().disabled) {
        this.popupVisible.set(false);
        untracked(() => this.popup()?.hide());
      }
    });
  }

  protected handleCollapseKeydown(event: KeyboardEvent, popup: TPopup): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      event.stopPropagation();
      popup.toggle();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault();
      popup.show();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      popup.hide();
    }
  }
}
