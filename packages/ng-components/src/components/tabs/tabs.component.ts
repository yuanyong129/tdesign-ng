import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  ViewEncapsulation,
  afterNextRender,
  booleanAttribute,
  computed,
  contentChildren,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild,
  viewChildren,
} from '@angular/core';
import { TTabPanel } from './tab-panel.component';
import { TabValue, TabsPlacement, TabsSize, TabsTheme } from './tabs.types';

/**
 * 选项卡。用于在同一区域切换多块内容。
 *
 * ```html
 * <t-tabs defaultValue="first">
 *   <t-tab-panel value="first" label="选项卡一">内容一</t-tab-panel>
 *   <t-tab-panel value="second" label="选项卡二">内容二</t-tab-panel>
 * </t-tabs>
 * ```
 */
@Component({
  selector: 't-tabs',
  standalone: true,
  imports: [NgTemplateOutlet],
  templateUrl: './tabs.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class TTabs {
  /** @zh 选项卡主题 @en Tabs theme @defaultValue 'normal' @values normal, card */
  readonly theme = input<TabsTheme>('normal');

  /** @zh 选项卡位置 @en Tab placement @defaultValue 'top' @values top, bottom, left, right */
  readonly placement = input<TabsPlacement>('top');

  /** @zh 选项卡尺寸 @en Tabs size @defaultValue 'medium' @values medium, large */
  readonly size = input<TabsSize>('medium');

  /** @zh 是否禁用全部选项卡 @en Whether all tabs are disabled @defaultValue false */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** @zh 当前激活的选项卡值，受控时以它为准 @en Active tab value (controlled) @defaultValue undefined */
  readonly value = input<TabValue | undefined>(undefined);

  /** @zh 默认激活的选项卡值 @en Default active tab value @defaultValue '' */
  readonly defaultValue = input<TabValue>('');

  /** @zh 激活选项卡变化时触发 @en Emits when the active tab changes */
  readonly change = output<TabValue>();

  /** 面板由内容投影提供，这里只读取它们的元信息用于渲染导航 */
  protected readonly panels = contentChildren(TTabPanel);

  private readonly innerValue = signal<TabValue | undefined>(undefined);
  private readonly injector = inject(Injector);

  /** 受控优先取 value，其次是内部值，最后回落到 defaultValue */
  protected readonly activeValue = computed<TabValue | undefined>(
    () => this.value() ?? this.innerValue() ?? this.defaultValue(),
  );

  protected readonly vertical = computed(
    () => this.placement() === 'left' || this.placement() === 'right',
  );

  protected readonly isCard = computed(() => this.theme() === 'card');

  private readonly navWrapRef = viewChild<ElementRef<HTMLElement>>('navWrap');
  private readonly navItemRefs = viewChildren<ElementRef<HTMLElement>>('navItem');

  /** 普通主题下当前选项卡下方的指示条位置 */
  protected readonly barStyle = signal<Record<string, string>>({ width: '0px', left: '0px' });

  constructor() {
    effect(() => {
      this.activeValue();
      this.panels();
      this.placement();
      this.isCard();
      untracked(() => this.scheduleBarUpdate());
    });
    afterNextRender(() => this.updateBar());
  }

  /** 面板未声明 value 时用下标作为值，与上游一致 */
  protected panelValue(panel: TTabPanel, index: number): TabValue {
    return panel.value() ?? index;
  }

  protected panelLabel(panel: TTabPanel, index: number): string {
    return panel.label() || `选项卡${index + 1}`;
  }

  protected isActiveAt(index: number): boolean {
    const panel = this.panels()[index];
    return !!panel && this.panelValue(panel, index) === this.activeValue();
  }

  protected isDisabledAt(index: number): boolean {
    const panel = this.panels()[index];
    return this.disabled() || (!!panel && panel.disabled());
  }

  protected select(index: number): void {
    if (this.isDisabledAt(index)) {
      return;
    }
    const panel = this.panels()[index];
    if (!panel) {
      return;
    }
    const next = this.panelValue(panel, index);
    if (next === this.activeValue()) {
      return;
    }
    if (this.value() === undefined) {
      this.innerValue.set(next);
    }
    this.change.emit(next);
  }

  /** 供 TTabPanel 判断自己是否为激活面板 */
  panelActive(panel: TTabPanel): boolean {
    const index = this.panels().indexOf(panel);
    return index >= 0 && this.panelValue(panel, index) === this.activeValue();
  }

  private scheduleBarUpdate(): void {
    afterNextRender(() => this.updateBar(), { injector: this.injector });
  }

  private updateBar(): void {
    if (this.isCard()) {
      return;
    }
    const wrap = this.navWrapRef()?.nativeElement;
    const items = this.navItemRefs();
    const index = this.panels().findIndex(
      (panel, i) => this.panelValue(panel, i) === this.activeValue(),
    );
    if (!wrap || index < 0 || !items[index]) {
      this.barStyle.set(this.vertical() ? { height: '0px', top: '0px' } : { width: '0px', left: '0px' });
      return;
    }
    const wrapRect = wrap.getBoundingClientRect();
    const itemRect = items[index].nativeElement.getBoundingClientRect();
    if (this.vertical()) {
      this.barStyle.set({
        height: `${itemRect.height}px`,
        top: `${itemRect.top - wrapRect.top}px`,
      });
    } else {
      this.barStyle.set({
        width: `${itemRect.width}px`,
        left: `${itemRect.left - wrapRect.left}px`,
      });
    }
  }

}
