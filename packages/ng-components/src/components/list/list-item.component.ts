import { ChangeDetectionStrategy, Component, ViewEncapsulation, input } from '@angular/core';

/**
 * @zh 列表项
 * @en List item
 */
@Component({
  selector: 't-list-item',
  standalone: true,
  templateUrl: './list-item.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class TListItem {
  /** @zh 列表项内容，也可以在宿主内投影 @en Item content, can also be projected into the host */
  readonly content = input<string | undefined>(undefined);

  /** @zh 列表项操作区内容 @en Item action content */
  readonly action = input<string | undefined>(undefined);
}
