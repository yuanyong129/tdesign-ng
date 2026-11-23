import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  TemplateRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { TLoading } from '../loading/loading.component';
// 只引用类型：父组件在运行时要拿到本组件的类去做 contentChildren 收集，
// 反向只借用它的类型（`import type` 会被完全擦除），因此不会形成运行时循环依赖。
import type { TimelineLabelAlign, TimelineLayout, TimelineMode, TimelineTheme } from './timeline.component';

/** 时间轴子项的标签位置，比父组件的 `labelAlign` 少了 `alternate`。 */
export const TIMELINE_ITEM_LABEL_ALIGNS = ['left', 'right', 'top', 'bottom'] as const;
export type TimelineItemLabelAlign = (typeof TIMELINE_ITEM_LABEL_ALIGNS)[number];

/** 时间轴子项的富文本属性：字符串按文本渲染，`TemplateRef` 交给 `*ngTemplateOutlet` 渲染。 */
export type TimelineItemContent = string | TemplateRef<unknown> | undefined;

/** 圆点颜色的主题取值，命中时用 `t-timeline-item__dot--{color}` 类，其余颜色走内联 border-color。 */
const DOT_THEMES: readonly string[] = ['default', 'primary', 'success', 'warning', 'error'];

/**
 * 父组件下发给子项的状态。
 *
 * 上游用 `provide` / `inject` 把 `layout`、`mode`、`theme`、`renderAlign`、`index`、`itemsStatus`
 * 传给每一项；Angular 侧由 `TTimeline` 在收集到子项后逐项写回（同 `t-radio-group` 的下发方式）。
 */
export interface TimelineItemState {
  /** 子项在（处理过 `reverse` 的）列表里的下标，决定 `alternate` 模式下居左还是居右。 */
  readonly index: number;
  /** 是否是列表里的最后一项，命中时隐藏连接线（`.t-timeline-item--last`）。 */
  readonly isLast: boolean;
  /** 时间轴方向。 */
  readonly layout: TimelineLayout;
  /** 标签与内容的排布模式。 */
  readonly mode: TimelineMode;
  /** 父组件换算后的对齐方式。 */
  readonly renderAlign: TimelineLabelAlign;
  /** 时间轴主题，决定连接线是实线还是虚线。 */
  readonly theme: TimelineTheme;
  /** 连接线状态，上游 `itemsStatus` 目前恒为 `['']`，保留是为了对齐类名。 */
  readonly status: string;
}

/** 子项尚未收到父组件状态时的兜底值，与上游默认 props 一致。 */
const DEFAULT_STATE: TimelineItemState = {
  index: 0,
  isLast: false,
  layout: 'vertical',
  mode: 'alternate',
  renderAlign: 'left',
  theme: 'default',
  status: '',
};

/** 子项的属性快照，与上游 `onClick` 上下文里的 `item` 对齐。 */
export interface TimelineItemProps {
  /** 内容。 */
  content?: TimelineItemContent;
  /** 自定义圆点。 */
  dot?: TimelineItemContent;
  /** 圆点颜色。 */
  dotColor?: string;
  /** 标签。 */
  label?: TimelineItemContent;
  /** 标签位置。 */
  labelAlign?: TimelineItemLabelAlign;
  /** 圆点是否为加载态。 */
  loading: boolean;
}

/** 点击时间轴子项时的事件参数，与上游 `onClick` 的 `{ e, item }` 对齐。 */
export interface TimelineItemClickEvent {
  /** 原生鼠标事件。 */
  e: MouseEvent;
  /** 当前子项的属性快照。 */
  item: TimelineItemProps;
}

/**
 * 时间轴子项。
 *
 * 结构对齐上游 `timeline-item.mjs`：标签（`alternate` 模式在左侧 / `same` 模式在内容下方）、
 * 圆点与连接线所在的 `__wrapper`、内容区。宿主就是 `.t-timeline-item`（上游的 `<li>`），
 * 位置类（`t-timeline-item-left` 等）与 `t-timeline-item--last` 都落在宿主上，
 * 样式全部来自 `vendor/tdesign-common/style/web/components/timeline/_index.less`。
 */
@Component({
  selector: 't-timeline-item',
  standalone: true,
  imports: [NgTemplateOutlet, TLoading],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    <!-- 富文本属性统一渲染入口：模板走 ngTemplateOutlet，其余按文本输出（等价于上游的 renderTNodeJSX）。 -->
    <ng-template #renderNode let-value>
      @if (asTemplate(value); as template) {
        <ng-container *ngTemplateOutlet="template" />
      } @else if (value) {
        {{ value }}
      }
    </ng-template>

    <ng-template #trendNode let-value>
      <ng-container *ngTemplateOutlet="renderNode; context: { $implicit: value }" />
    </ng-template>

    @if (status().mode === 'alternate' && label()) {
      <div class="t-timeline-item__label t-timeline-item__label--alternate">
        <ng-container *ngTemplateOutlet="renderNode; context: { $implicit: label() }" />
      </div>
    }

    <div class="t-timeline-item__wrapper">
      <div [class]="dotClasses()" [style.borderColor]="dotBorderColor()">
        @if (dot()) {
          <div class="t-timeline-item__dot-content">
            <ng-container *ngTemplateOutlet="renderNode; context: { $implicit: dot() }" />
          </div>
        } @else if (loading()) {
          <div class="t-timeline-item__dot-content">
            <t-loading size="small" />
          </div>
        }
      </div>
      <div [class]="tailClasses()"></div>
    </div>

    <div class="t-timeline-item__content">
      @if (content()) {
        <ng-container *ngTemplateOutlet="renderNode; context: { $implicit: content() }" />
      }
      <ng-content />

      @if (status().mode === 'same' && label()) {
        <div class="t-timeline-item__label t-timeline-item__label--same">
          <ng-container *ngTemplateOutlet="renderNode; context: { $implicit: label() }" />
        </div>
      }
    </div>
  `,
  host: {
    '[class]': 'classes()',
    '(click)': 'handleClick($event)',
  },
})
export class TTimelineItem {
  /** @zh 内容，也可以用内容投影传入 @en Content, can also be provided by content projection @defaultValue undefined */
  readonly content = input<TimelineItemContent>();

  /** @zh 自定义圆点 @en Custom dot @defaultValue undefined */
  readonly dot = input<TimelineItemContent>();

  /** @zh 圆点颜色，可传主题色（default/primary/success/warning/error）或任意颜色值 @en Dot color, a theme color (default/primary/success/warning/error) or any color value @defaultValue primary */
  readonly dotColor = input<string>('primary');

  /** @zh 标签 @en Label @defaultValue undefined */
  readonly label = input<TimelineItemContent>();

  /** @zh 标签位置，会覆盖父组件的 labelAlign @en Label position, overrides the parent labelAlign @defaultValue undefined @values left,right,top,bottom */
  readonly labelAlign = input<TimelineItemLabelAlign>();

  /** @zh 圆点是否为加载态 @en Whether the dot is loading @defaultValue false */
  readonly loading = input(false, { transform: booleanAttribute });

  /** @zh 点击时间轴子项 @en Click the timeline item */
  readonly itemClick = output<TimelineItemClickEvent>();

  /** 宿主元素，父组件用它把子项按 `reverse` 后的顺序重新排列。 */
  readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);

  private readonly state = signal<TimelineItemState>(DEFAULT_STATE);

  /** 子项在列表里的定位信息，由 `TTimeline` 下发。 */
  protected readonly status = this.state.asReadonly();

  protected readonly classes = computed(() => {
    const state = this.state();
    const align = this.labelAlign() ?? state.renderAlign;
    const left = state.layout === 'horizontal' ? 'top' : 'left';
    const right = state.layout === 'horizontal' ? 'bottom' : 'right';

    const classes = ['t-timeline-item'];
    if (align === 'alternate') {
      classes.push(`t-timeline-item-${state.index % 2 === 0 ? left : right}`);
    } else if (align === left) {
      classes.push(`t-timeline-item-${left}`);
    } else if (align === right) {
      classes.push(`t-timeline-item-${right}`);
    }
    if (state.isLast) {
      classes.push('t-timeline-item--last');
    }
    return classes.join(' ');
  });

  protected readonly dotClasses = computed(() => {
    const dotColor = this.dotColor();
    const classes = ['t-timeline-item__dot'];
    if (this.dot() || this.loading()) {
      classes.push('t-timeline-item__dot--custom');
    }
    if (dotColor && DOT_THEMES.includes(dotColor)) {
      classes.push(`t-timeline-item__dot--${dotColor}`);
    }
    return classes.join(' ');
  });

  /** 非主题色的圆点颜色由上游以内联 `border-color` 下发。 */
  protected readonly dotBorderColor = computed<string | null>(() => {
    const dotColor = this.dotColor();
    return dotColor && !DOT_THEMES.includes(dotColor) ? dotColor : null;
  });

  protected readonly tailClasses = computed(() => {
    const state = this.state();
    return [
      't-timeline-item__tail',
      `t-timeline-item__tail--theme-${state.theme}`,
      `t-timeline-item__tail--status-${state.status}`,
    ].join(' ');
  });

  /** 由 `TTimeline` 调用，写回父组件的布局与定位信息。 */
  setTimelineState(state: TimelineItemState): void {
    this.state.set(state);
  }

  /** 判断一个取值是不是模板，模板用 `*ngTemplateOutlet` 渲染，其余按文本渲染。 */
  protected asTemplate(value: TimelineItemContent): TemplateRef<unknown> | null {
    return value instanceof TemplateRef ? value : null;
  }

  protected handleClick(event: Event): void {
    this.itemClick.emit({
      e: event as MouseEvent,
      item: {
        content: this.content(),
        dot: this.dot(),
        dotColor: this.dotColor(),
        label: this.label(),
        labelAlign: this.labelAlign(),
        loading: this.loading(),
      },
    });
  }
}
