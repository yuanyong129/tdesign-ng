import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  inject,
  input,
} from '@angular/core';
import { TTabs } from './tabs.component';
import { TabValue } from './tabs.types';

/**
 * 选项卡面板。放在 `t-tabs` 内部，标签与内容都由它提供。
 *
 * ```html
 * <t-tab-panel value="first" label="选项卡一">内容一</t-tab-panel>
 * ```
 */
@Component({
  selector: 't-tab-panel',
  standalone: true,
  templateUrl: './tab-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class TTabPanel {
  private readonly tabs = inject(TTabs);

  /** @zh 选项卡值，未声明时使用所在位置的下标 @en Tab value, defaults to the panel index @defaultValue undefined */
  readonly value = input<TabValue | undefined>(undefined);

  /** @zh 选项卡标题 @en Tab label @defaultValue '' */
  readonly label = input('');

  /** @zh 是否禁用该选项卡 @en Whether the tab is disabled @defaultValue false */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** 当前面板是否处于激活状态（由 t-tabs 计算） */
  protected readonly active = computed(() => this.tabs.panelActive(this));
}
