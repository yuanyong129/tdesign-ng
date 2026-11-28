import { NgTemplateOutlet } from '@angular/common';
import { isTemplateContent } from '../../_utils/content';
import type { Content } from '../../_utils/content';
import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import { TTabs } from './tabs.component';
import { TabValue } from './tabs.types';

let tabPanelUid = 0;

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
  imports: [NgTemplateOutlet],
  templateUrl: './tab-panel.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class TTabPanel {
  private readonly tabs = inject(TTabs);
  readonly panelId = `t-tab-panel-${++tabPanelUid}`;
  readonly tabId = `${this.panelId}-tab`;
  protected readonly isTemplateContent = isTemplateContent;

  /** @zh 选项卡值，未声明时使用所在位置的下标 @en Tab value, defaults to the panel index @defaultValue undefined */
  readonly value = input<TabValue | undefined>(undefined);

  /** @zh 选项卡标题 @en Tab label @defaultValue '' */
  readonly label = input<Content>('');

  /** @zh 面板内容，显式内容优先于投影，支持字符串或模板 @en Panel content as text or a template, takes precedence over projection @defaultValue undefined */
  readonly panel = input<Content>(undefined);

  /** @zh 是否禁用该选项卡 @en Whether the tab is disabled @defaultValue false */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** @zh 是否显示关闭按钮 @en Whether to show the close icon @defaultValue false */
  readonly removable = input(false, { transform: booleanAttribute });

  /** @zh 是否允许拖拽排序（配合 t-tabs 的 dragSort） @en Whether this tab can be dragged @defaultValue true */
  readonly draggable = input(true, { transform: booleanAttribute });

  /** @zh 是否在首次激活时才渲染内容 @en Whether to render the content on first activation @defaultValue false */
  readonly lazy = input(false, { transform: booleanAttribute });

  /** @zh 是否在隐藏时销毁内容 @en Whether to destroy the content when hidden @defaultValue false */
  readonly destroyOnHide = input(false, { transform: booleanAttribute });

  /** 当前面板是否处于激活状态（由 t-tabs 计算） */
  readonly active = computed(() => this.tabs.panelActive(this));

  /** 是否曾经被激活过（lazy 面板首次激活后才渲染内容） */
  private readonly activatedOnce = signal(false);

  constructor() {
    effect(() => {
      if (this.active()) {
        this.activatedOnce.set(true);
      }
    });
  }

  /** 面板内容是否渲染：destroyOnHide 只在激活时渲染，lazy 首次激活后一直保留，其余始终渲染 */
  protected readonly rendered = computed(() => {
    if (this.destroyOnHide()) {
      return this.active();
    }
    if (this.lazy()) {
      return this.activatedOnce();
    }
    return true;
  });
}
