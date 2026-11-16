import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  contentChildren,
  effect,
  input,
  untracked,
} from '@angular/core';
import { TAvatar } from './avatar.component';
import { AVATAR_CASCADINGS, AvatarCascading } from './avatar.types';

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
  imports: [TAvatar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './avatar-group.component.html',
})
export class TAvatarGroup {
  /** @zh 最多显示的头像个数，超出显示 +N @en Max visible avatars, the rest collapse into +N @defaultValue undefined */
  readonly max = input<number | undefined>(undefined);

  /** @zh 层叠方向 @en Cascading direction @defaultValue 'right-up' @values left-up, right-up */
  readonly cascading = input<AvatarCascading>('right-up');

  /** @zh 折叠头像的文字，默认 +N @en Text of the collapse avatar, defaults to +N @defaultValue undefined */
  readonly collapseAvatar = input<string | undefined>(undefined);

  /** @zh 统一尺寸，会下发给组内所有头像 @en Size applied to all avatars in the group @defaultValue undefined */
  readonly size = input<string | undefined>(undefined);

  protected readonly cascadings = AVATAR_CASCADINGS;

  private readonly avatars = contentChildren(TAvatar);

  protected readonly classes = computed(() =>
    ['t-avatar-group', this.cascading() === 'right-up' ? 't-avatar--offset-right' : 't-avatar--offset-left']
      .filter(Boolean)
      .join(' '),
  );

  protected readonly collapsedCount = computed(() => {
    const max = this.max();
    if (max === undefined) return 0;
    return Math.max(this.avatars().length - max, 0);
  });

  protected readonly collapseText = computed(
    () => this.collapseAvatar() ?? (this.collapsedCount() > 0 ? `+${this.collapsedCount()}` : ''),
  );

  constructor() {
    effect(() => {
      const max = this.max();
      const size = this.size();
      const avatars = this.avatars();
      untracked(() => {
        avatars.forEach((avatar, index) => {
          avatar.setGroupHidden(max !== undefined && index >= max);
          avatar.setGroupSize(size);
        });
      });
    });
  }
}
