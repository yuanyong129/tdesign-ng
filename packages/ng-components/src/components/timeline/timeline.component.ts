import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  contentChildren,
  effect,
  inject,
  input,
} from '@angular/core';
import { TTimelineItem, type TimelineItemState } from './timeline-item.component';

/** 时间轴标签位置。 */
export const TIMELINE_LABEL_ALIGNS = ['left', 'right', 'alternate', 'top', 'bottom'] as const;
export type TimelineLabelAlign = (typeof TIMELINE_LABEL_ALIGNS)[number];

/** 时间轴方向。 */
export const TIMELINE_LAYOUTS = ['horizontal', 'vertical'] as const;
export type TimelineLayout = (typeof TIMELINE_LAYOUTS)[number];

/** 时间轴模式。 */
export const TIMELINE_MODES = ['alternate', 'same'] as const;
export type TimelineMode = (typeof TIMELINE_MODES)[number];

/** 时间轴主题。 */
export const TIMELINE_THEMES = ['default', 'dot'] as const;
export type TimelineTheme = (typeof TIMELINE_THEMES)[number];

/** 纵向时间轴可用的标签对齐；横向时间轴传入其中一种时会被换算。 */
const VERTICAL_ALIGNS: readonly TimelineLabelAlign[] = ['left', 'right'];
/** 横向时间轴可用的标签对齐；纵向时间轴传入其中一种时会被换算。 */
const HORIZONTAL_ALIGNS: readonly TimelineLabelAlign[] = ['top', 'bottom'];

/**
 * 时间轴。
 *
 * 子项由 `t-timeline-item` 提供，父组件通过 `contentChildren` 收集后逐项下发 `index`、
 * `isLast`、`layout`、`mode`、`theme`、`renderAlign`（对齐上游的 `provide` 上下文）。
 * `reverse` 在上游是真实反转渲染顺序（less 里没有 `-reverse` 规则），因此这里除了补
 * `t-timeline-reverse` 类，还会把子项宿主节点按反转后的顺序重新排列。
 *
 * 视觉样式全部来自 tdesign-common（`@tdesign-ng/styles`），组件只负责结构与修饰类。
 */
@Component({
  selector: 't-timeline',
  standalone: true,
  template: `<ng-content />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'classes()',
  },
})
export class TTimeline {
  /** @zh 标签位置。横向时间轴只能取 top / bottom，纵向时间轴只能取 left / right，传错时会自动换算 @en Label position. A horizontal timeline only accepts top / bottom, a vertical one only accepts left / right, and a mismatched value is converted automatically @defaultValue left @values left,right,alternate,top,bottom */
  readonly labelAlign = input<TimelineLabelAlign>('left');

  /** @zh 时间轴方向 @en Timeline layout @defaultValue vertical @values horizontal,vertical */
  readonly layout = input<TimelineLayout>('vertical');

  /** @zh 标签与内容的排布模式，alternate 为左右交替，same 为标签与内容同侧 @en Whether labels alternate side by side with the content @defaultValue alternate @values alternate,same */
  readonly mode = input<TimelineMode>('alternate');

  /** @zh 是否反向排列子项 @en Whether to display the items in reverse order @defaultValue false */
  readonly reverse = input(false, { transform: booleanAttribute });

  /** @zh 主题，dot 把连接线换成虚线 @en Timeline theme, dot renders the connector as a dashed line @defaultValue default @values default,dot */
  readonly theme = input<TimelineTheme>('default');

  private readonly items = contentChildren(TTimelineItem, { descendants: true });

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** 按 `reverse` 处理后的子项顺序，`index` / `--last` 都基于这个顺序计算。 */
  private readonly orderedItems = computed<readonly TTimelineItem[]>(() => {
    const items = this.items();
    return this.reverse() ? [...items].reverse() : items;
  });

  /** 对齐方式：纵向时间轴默认 left，横向默认 top，跨轴取值按上游规则换算。 */
  protected readonly renderAlign = computed<TimelineLabelAlign>(() => {
    const labelAlign = this.labelAlign();
    const isVertical = this.layout() === 'vertical';
    const defaultAligns = isVertical ? VERTICAL_ALIGNS : HORIZONTAL_ALIGNS;
    const crossAligns = isVertical ? HORIZONTAL_ALIGNS : VERTICAL_ALIGNS;

    const crossIndex = crossAligns.indexOf(labelAlign);
    return crossIndex === -1 ? labelAlign : defaultAligns[crossIndex];
  });

  protected readonly classes = computed(() => {
    const classes = ['t-timeline', `t-timeline-${this.renderAlign()}`];
    if (this.reverse()) {
      classes.push('t-timeline-reverse');
    }
    classes.push('t-timeline-label', `t-timeline-label--${this.mode()}`, `t-timeline-${this.layout()}`);
    return classes.join(' ');
  });

  /** 上一次写入 DOM 的子项顺序，避免每次变更检测都搬动节点。 */
  private appliedOrder = '';

  constructor() {
    effect(() => {
      const items = this.orderedItems();
      const state: Omit<TimelineItemState, 'index' | 'isLast'> = {
        layout: this.layout(),
        mode: this.mode(),
        renderAlign: this.renderAlign(),
        theme: this.theme(),
        status: '',
      };

      items.forEach((item, index) => {
        item.setTimelineState({ ...state, index, isLast: index === items.length - 1 });
      });

      this.scheduleOrder(items);
    });
  }

  /**
   * 把子项宿主节点按目标顺序重新插入父节点。
   *
   * 内容投影无法在模板里改顺序，所以只能移动真实的 DOM 节点；首次渲染时子项可能还没进入
   * DOM，因此用一帧兜底再试一次（与 `t-radio-group` 绘制背景块的写法一致）。
   */
  private scheduleOrder(items: readonly TTimelineItem[], attempt = 0): void {
    if (this.applyOrder(items)) {
      return;
    }
    if (typeof requestAnimationFrame === 'undefined' || attempt >= 3) {
      return;
    }
    requestAnimationFrame(() => this.scheduleOrder(items, attempt + 1));
  }

  /** 返回 `true` 表示顺序已经与目标一致（或本就无需调整）。 */
  private applyOrder(items: readonly TTimelineItem[]): boolean {
    const desired = items.map((item) => item.elementRef.nativeElement);
    if (desired.length === 0) {
      this.appliedOrder = '';
      return true;
    }

    const host = this.host.nativeElement;
    const current = Array.from(host.children) as HTMLElement[];
    if (current.length !== desired.length || !desired.every((element) => current.includes(element))) {
      return false;
    }

    const order = desired.map((element) => current.indexOf(element)).join(',');
    if (order === this.appliedOrder) {
      return true;
    }
    this.appliedOrder = order;
    // 顺序已经与当前 DOM 一致时不要搬动节点：反复 appendChild 会重置行内动画与焦点。
    if (order === desired.map((_, index) => index).join(',')) {
      return true;
    }
    for (const element of desired) {
      host.appendChild(element);
    }
    return true;
  }
}
