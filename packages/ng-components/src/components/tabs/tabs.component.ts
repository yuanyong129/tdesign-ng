import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  OnDestroy,
  ViewEncapsulation,
  afterNextRender,
  booleanAttribute,
  computed,
  contentChildren,
  effect,
  forwardRef,
  inject,
  input,
  output,
  signal,
  untracked,
  viewChild,
  viewChildren,
} from '@angular/core';
import { TTabPanel } from './tab-panel.component';
import { createControllableState } from '../../_utils/controllable-state';
import { isContentEmpty, isTemplateContent } from '../../_utils/content';
import type { Content } from '../../_utils/content';
import {
  TabValue,
  TabsAddEvent,
  TabsDragSortEvent,
  TabsPlacement,
  TabsRemoveEvent,
  TabsScrollPosition,
  TabsSize,
  TabsTheme,
  TabsListItem,
} from './tabs.types';

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
  imports: [NgTemplateOutlet, forwardRef(() => TTabPanel)],
  templateUrl: './tabs.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class TTabs implements OnDestroy {
  /** @zh 选项卡主题 @en Tabs theme @defaultValue 'normal' @values normal, card */
  readonly theme = input<TabsTheme>('normal');

  /** @zh 选项卡位置 @en Tab placement @defaultValue 'top' @values top, bottom, left, right */
  readonly placement = input<TabsPlacement>('top');

  /** @zh 选项卡尺寸 @en Tabs size @defaultValue 'medium' @values medium, large */
  readonly size = input<TabsSize>('medium');

  /** @zh 是否禁用全部选项卡 @en Whether all tabs are disabled @defaultValue false */
  readonly disabled = input(false, { transform: booleanAttribute });

  /** @zh 是否显示新增按钮 @en Whether to show the add button @defaultValue false */
  readonly addable = input(false, { transform: booleanAttribute });

  /** @zh 是否开启拖拽排序，排序结果由 (dragSortChange) 抛给使用方 @en Whether tabs can be dragged to sort @defaultValue false */
  readonly dragSort = input(false, { transform: booleanAttribute });

  /** @zh 激活选项卡滚入可视区时的对齐方式 @en Alignment used when scrolling the active tab into view @defaultValue 'auto' @values auto, start, center, end */
  readonly scrollPosition = input<TabsScrollPosition>('auto');

  /** @zh 当前激活的选项卡值，受控时以它为准 @en Active tab value (controlled) @defaultValue undefined */
  readonly value = input<TabValue | undefined>(undefined);

  /** @zh 默认激活的选项卡值 @en Default active tab value @defaultValue '' */
  readonly defaultValue = input<TabValue>('');

  /** @zh 导航栏右侧的操作内容，支持字符串或模板 @en Actions beside the tab navigation, as text or a template @defaultValue undefined */
  readonly action = input<Content>(undefined);

  /** @zh 数据驱动面板，非空时优先于投影，空数组回退到投影 @en Data panels, a nonempty list takes precedence over projected panels @defaultValue [] */
  readonly list = input<TabsListItem[]>([]);

  protected readonly isTemplateContent = isTemplateContent;
  protected readonly hasAction = computed(() => !isContentEmpty(this.action()));

  /** @zh 激活选项卡变化时触发 @en Emits when the active tab changes */
  readonly change = output<TabValue>();

  /** @zh 点击新增按钮时触发 @en Emits when the add button is clicked */
  readonly add = output<TabsAddEvent>();

  /** @zh 点击页签关闭按钮时触发 @en Emits when a tab close icon is clicked */
  readonly remove = output<TabsRemoveEvent>();

  /** @zh 拖拽排序时触发，使用方按 payload 重排自己的面板数据 @en Emits when tabs are dropped at a new position */
  readonly dragSortChange = output<TabsDragSortEvent>();

  /** 数据列表与投影复用面板元信息和导航逻辑。 */
  private readonly projectedPanels = contentChildren(TTabPanel);
  private readonly listPanels = viewChildren(TTabPanel);
  protected readonly panels = computed(() => this.list().length ? this.listPanels() : this.projectedPanels());

  private readonly state = createControllableState(this.value, () => this.defaultValue());
  private readonly injector = inject(Injector);

  /** 受控值优先，默认值仅初始化一次。 */
  protected readonly activeValue = this.state.current;
  protected readonly focusIndex = computed(() => {
    const active = this.panels().findIndex((panel, i) => this.panelValue(panel, i) === this.activeValue() && !this.isDisabledAt(i));
    return active >= 0 ? active : this.panels().findIndex((_, i) => !this.isDisabledAt(i));
  });

  protected readonly vertical = computed(
    () => this.placement() === 'left' || this.placement() === 'right',
  );

  protected readonly isCard = computed(() => this.theme() === 'card');

  private readonly navScrollRef = viewChild<ElementRef<HTMLElement>>('navScroll');
  private readonly navWrapRef = viewChild<ElementRef<HTMLElement>>('navWrap');
  private readonly operationsRef = viewChild<ElementRef<HTMLElement>>('operations');
  protected readonly operationsWidth = signal(0);
  private readonly navItemRefs = viewChildren<ElementRef<HTMLElement>>('navItem');

  /** 普通主题下当前选项卡下方的指示条位置 */
  protected readonly barStyle = signal<Record<string, string>>({ width: '0px', left: '0px' });

  /** 导航横向滚动的当前偏移与上限 */
  private readonly scrollLeft = signal(0);
  private readonly maxScrollLeft = signal(0);

  /** 保留源面板身份，防止数据更新后旧下标指向其它页签。 */
  private readonly dragSource = signal<TTabPanel | null>(null);

  protected readonly canToLeft = computed(() => this.scrollLeft() > 0);
  protected readonly canToRight = computed(() => this.scrollLeft() < this.maxScrollLeft() - 1);

  /** 导航容器内容的位移，隐藏区域靠 translate 移出 */
  protected readonly wrapTransform = computed(() =>
    this.vertical() ? null : `translate3d(${-this.scrollLeft()}px, 0, 0)`,
  );

  private resizeObserver?: ResizeObserver;

  constructor() {
    effect(() => {
      this.activeValue();
      this.panels();
      this.panels().forEach((panel) => { panel.label(); panel.value(); panel.removable(); panel.disabled(); });
      this.placement();
      this.isCard();
      this.scrollPosition();
      this.action();
      this.navScrollRef();
      this.operationsRef();
      this.navItemRefs();
      untracked(() => this.scheduleNavUpdate());
    });
    afterNextRender(() => {
      this.setupNavObserver();
      this.refreshNav();
    });
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
  }

  /** 面板未声明 value 时用下标作为值，与上游一致 */
  protected panelValue(panel: TTabPanel, index: number): TabValue {
    return panel.value() ?? index;
  }

  protected panelLabel(panel: TTabPanel, index: number): Content {
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

  protected isDraggableAt(index: number): boolean {
    const panel = this.panels()[index];
    return this.dragSort() && !!panel && panel.draggable() && !this.isDisabledAt(index);
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
    this.state.set(next);
    this.change.emit(next);
  }

  /** 供 TTabPanel 判断自己是否为激活面板 */
  panelActive(panel: TTabPanel): boolean {
    const index = this.panels().indexOf(panel);
    return index >= 0 && this.panelValue(panel, index) === this.activeValue();
  }

  protected handleAdd(event: MouseEvent): void {
    if (this.disabled() || !this.addable()) return;
    this.add.emit({ e: event });
  }

  protected handleRemove(event: MouseEvent | KeyboardEvent, index: number): void {
    event.stopPropagation();
    const panel = this.panels()[index];
    if (!panel || this.isDisabledAt(index) || !panel.removable()) {
      return;
    }
    const value = this.panelValue(panel, index);
    const callback = this.list().length ? this.list()[index]?.onRemove : undefined;
    this.remove.emit({ value, index, e: event });
    callback?.({ value, e: event });
    if (event.type === 'keydown') {
      afterNextRender(() => {
        const remaining = this.panels();
        const same = remaining.indexOf(panel);
        const start = same >= 0 ? same : Math.min(index, remaining.length - 1);
        const target = remaining.map((_, i) => i).filter((i) => !this.isDisabledAt(i))
          .sort((a, b) => Math.abs(a - start) - Math.abs(b - start))[0];
        if (target !== undefined) this.navItemRefs()[target]?.nativeElement.focus();
      }, { injector: this.injector });
    }
  }

  protected handleKeydown(event: KeyboardEvent, index: number): void {
    if (event.target !== event.currentTarget || this.isDisabledAt(index) || event.isComposing) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault(); this.select(index); return;
    }
    if (event.key === 'Delete') {
      if (this.panels()[index]?.removable()) { event.preventDefault(); this.handleRemove(event, index); }
      return;
    }
    const previous = this.vertical() ? 'ArrowUp' : 'ArrowLeft';
    const next = this.vertical() ? 'ArrowDown' : 'ArrowRight';
    if (![previous, next, 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const enabled = this.panels().map((_, i) => i).filter((i) => !this.isDisabledAt(i));
    const current = enabled.indexOf(index);
    const target = event.key === 'Home' ? enabled[0] : event.key === 'End' ? enabled[enabled.length - 1]
      : enabled[(current + (event.key === next ? 1 : -1) + enabled.length) % enabled.length];
    if (target === undefined) return;
    this.navItemRefs()[target]?.nativeElement.focus();
    this.select(target);
  }

  protected handleWheel(event: WheelEvent): void {
    if (this.vertical() || this.maxScrollLeft() <= 0) {
      return;
    }
    const delta =
      Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
    if (!delta) {
      return;
    }
    event.preventDefault();
    this.setScrollLeft(this.scrollLeft() + delta);
  }

  protected scrollNav(direction: 'prev' | 'next'): void {
    const step = this.navScrollRef()?.nativeElement.clientWidth ?? 0;
    this.setScrollLeft(this.scrollLeft() + (direction === 'next' ? step : -step));
  }

  protected onDragStart(event: DragEvent, index: number): void {
    this.dragSource.set(null);
    if (!this.isDraggableAt(index)) {
      event.preventDefault();
      return;
    }
    this.dragSource.set(this.panels()[index]);
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('text/plain', String(index));
    }
  }

  protected onDragOver(event: DragEvent): void {
    if (!this.dragSort() || this.disabled() || this.dragSource() === null) {
      return;
    }
    event.preventDefault();
    if (event.dataTransfer) {
      event.dataTransfer.dropEffect = 'move';
    }
  }

  protected onDrop(event: DragEvent, index: number): void {
    if (!this.dragSort() || this.disabled()) {
      this.dragSource.set(null);
      return;
    }
    event.preventDefault();
    const from = this.panels().indexOf(this.dragSource()!);
    this.dragSource.set(null);
    if (from < 0 || from === index || !this.isDraggableAt(from) || this.isDisabledAt(index)) {
      return;
    }
    const source = this.panels()[from];
    const target = this.panels()[index];
    if (!source || !target) {
      return;
    }
    this.dragSortChange.emit({
      currentIndex: from,
      current: this.panelValue(source, from),
      targetIndex: index,
      target: this.panelValue(target, index),
    });
  }

  protected onDragEnd(): void {
    this.dragSource.set(null);
  }

  private setScrollLeft(value: number): void {
    const max = this.maxScrollLeft();
    this.scrollLeft.set(Math.min(Math.max(value, 0), max));
  }

  private scheduleNavUpdate(): void {
    afterNextRender(() => this.refreshNav(), { injector: this.injector });
  }

  private refreshNav(): void {
    this.setupNavObserver();
    this.measureOperations();
    this.updateBar();
    this.measureNavScroll();
    this.scrollActiveIntoView();
  }

  private setupNavObserver(): void {
    const scroll = this.navScrollRef()?.nativeElement;
    if (!scroll || typeof ResizeObserver === 'undefined') {
      return;
    }
    this.resizeObserver?.disconnect();
    this.resizeObserver = new ResizeObserver(() => {
      this.measureOperations();
      this.measureNavScroll();
      this.updateBar();
    });
    this.resizeObserver.observe(scroll);
    for (const item of this.navItemRefs()) this.resizeObserver.observe(item.nativeElement);
    const operations = this.operationsRef()?.nativeElement;
    if (operations) this.resizeObserver.observe(operations);
  }

  private measureOperations(): void {
    this.operationsWidth.set(this.operationsRef()?.nativeElement.getBoundingClientRect().width ?? 0);
  }

  private measureNavScroll(): void {
    if (this.vertical()) {
      this.maxScrollLeft.set(0);
      this.scrollLeft.set(0);
      return;
    }
    const scroll = this.navScrollRef()?.nativeElement;
    const wrap = this.navWrapRef()?.nativeElement;
    if (!scroll || !wrap) {
      return;
    }
    const max = Math.max(0, wrap.scrollWidth - scroll.clientWidth);
    this.maxScrollLeft.set(max);
    this.setScrollLeft(this.scrollLeft());
  }

  /** 按 scrollPosition 把激活项滚到可视区 */
  private scrollActiveIntoView(): void {
    if (this.vertical()) {
      return;
    }
    const scroll = this.navScrollRef()?.nativeElement;
    const items = this.navItemRefs();
    const index = this.panels().findIndex(
      (panel, i) => this.panelValue(panel, i) === this.activeValue(),
    );
    if (!scroll || index < 0 || !items[index]) {
      return;
    }
    const item = items[index].nativeElement;
    const start = item.offsetLeft;
    const end = start + item.offsetWidth;
    const viewStart = this.scrollLeft();
    const viewEnd = viewStart + scroll.clientWidth;
    let target: number | null = null;
    switch (this.scrollPosition()) {
      case 'start':
        target = start;
        break;
      case 'center':
        target = start - (scroll.clientWidth - item.offsetWidth) / 2;
        break;
      case 'end':
        target = end - scroll.clientWidth;
        break;
      default:
        if (start < viewStart) {
          target = start;
        } else if (end > viewEnd) {
          target = end - scroll.clientWidth;
        }
    }
    if (target !== null) {
      this.setScrollLeft(target);
    }
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
      this.barStyle.set(
        this.vertical() ? { height: '0px', top: '0px' } : { width: '0px', left: '0px' },
      );
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
