import { ChangeDetectionStrategy, Component, ViewEncapsulation, input } from '@angular/core';

/**
 * @zh 列表项元信息
 * @en List item meta
 */
@Component({
  selector: 't-list-item-meta',
  standalone: true,
  templateUrl: './list-item-meta.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class TListItemMeta {
  /** @zh 头像图片地址 @en Avatar image url */
  readonly image = input<string | undefined>(undefined);

  /** @zh 标题 @en Title */
  readonly title = input<string | undefined>(undefined);

  /** @zh 描述 @en Description */
  readonly description = input<string | undefined>(undefined);
}
