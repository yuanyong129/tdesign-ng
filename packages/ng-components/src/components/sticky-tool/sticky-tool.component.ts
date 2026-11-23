import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  ViewEncapsulation,
  computed,
  input,
  output,
} from '@angular/core';
import { TPopup } from '../popup';

/** 侧边悬浮的停靠位置。 */
export const STICKY_TOOL_PLACEMENTS = [
  'right-top',
  'right-center',
  'right-bottom',
  'left-top',
  'left-center',
  'left-bottom',
] as const;
export type StickyToolPlacement = (typeof STICKY_TOOL_PLACEMENTS)[number];

/** 侧边悬浮的形状。 */
export const STICKY_TOOL_SHAPES = ['square', 'round'] as const;
export type StickyToolShape = (typeof STICKY_TOOL_SHAPES)[number];

/** 侧边悬浮的展示形式。 */
export const STICKY_TOOL_TYPES = ['normal', 'compact'] as const;
export type StickyToolType = (typeof STICKY_TOOL_TYPES)[number];

/** 子项的弹层触发方式。 */
export const STICKY_TOOL_ITEM_TRIGGERS = ['hover', 'click'] as const;
export type StickyToolItemTrigger = (typeof STICKY_TOOL_ITEM_TRIGGERS)[number];

/** 子项里的富文本取值：字符串按文本渲染，`TemplateRef` 交给 `*ngTemplateOutlet` 渲染。 */
export type StickyToolNode = string | TemplateRef<unknown> | undefined;

/**
 * 侧边悬浮的子项。
 *
 * 与上游 `TdStickyItemProps` 对齐，仅少一个 `popupProps`（见 `[D3]` 说明）。
 */
export interface StickyToolItem {
  /** 图标，字符串按文本渲染，推荐传模板（例如内含 `<t-icon />`）。 */
  icon?: StickyToolNode;
  /** 文案。 */
  label?: StickyToolNode;
  /** 悬浮/点击后展示的弹层内容。 */
  popup?: StickyToolNode;
  /** 弹层触发方式。 */
  trigger?: StickyToolItemTrigger;
}

/** 子项点击/悬浮事件，`item` 是被操作的子项。 */
export interface StickyToolItemEvent {
  e: MouseEvent;
  item: StickyToolItem;
}

/**
 * 侧边悬浮。
 *
 * 根节点类名与上游一致：`t-sticky-tool` + `t-sticky-tool--{shape}`；位置用
 * `placement` 拆成「水平 + 垂直」两段，分别写 `left`/`right` 与 `top`/`bottom` 的内联样式，
 * 居中段（`*-center`）改用 `top: 50%` + `translate(0, -50%)`，与上游 `getOffset()` 的产物一致。
 * `offset` 是在基础偏移（水平 80px、垂直 24px）之上的增量：数字相加、字符串写进 `calc()`。
 *
 * 每个子项渲染 `t-sticky-item`、`t-sticky-item--{type}`、`t-sticky-item--{shape}`，
 * `type === 'normal'` 时才有 `t-sticky-item__label`；设置了 `width` 时子项内联
 * `margin: calc((width - 56px)/2)`（`compact` 用 40px），让子项撑满整体宽度。
 * 有 `popup` 的子项包在 `t-popup` 里，弹层内层类名固定为 `t-sticky-tool-popup-content`。
 *
 * 样式唯一定义处是 `vendor/tdesign-common/style/web/components/sticky-tool/`。
 *
 * 点击与悬浮分别派发 `(itemClick)` / `(itemHover)`（上游 `onClick` / `onHover`），
 * 因为这两个事件的上下文里带 `item`，原生事件无法表达。
 */
@Component({
  selector: 't-sticky-tool',
  standalone: true,
  imports: [NgTemplateOutlet, TPopup],
  template: `
    <!-- 富文本属性统一渲染入口：模板走 ngTemplateOutlet，其余按文本输出（等价于上游的 renderTNodeJSX）。 -->
    <ng-template #renderNode let-value>
      @if (asTemplate(value); as template) {
        <ng-container *ngTemplateOutlet="template" />
      } @else if (value) {
        {{ value }}
      }
    </ng-template>

    <ng-template #stickyItem let-item>
      <div
        [class]="itemClasses()"
        [style]="itemStyle()"
        (click)="handleItemClick($event, item)"
        (mouseenter)="handleItemHover($event, item)"
      >
        @if (asTemplate(item.icon); as template) {
          <ng-container *ngTemplateOutlet="template" />
        } @else if (item.icon) {
          {{ item.icon }}
        }
        @if (type() === 'normal' && item.label) {
          <div class="t-sticky-item__label">
            <ng-container *ngTemplateOutlet="renderNode; context: { $implicit: item.label }" />
          </div>
        }
      </div>
    </ng-template>

    <div [class]="rootClasses()" [style]="rootStyle()">
      @for (item of list(); track $index) {
        @if (item.popup) {
          <t-popup
            [trigger]="item.trigger ?? 'hover'"
            [placement]="popupPlacement()"
            [hideEmptyPopup]="true"
            overlayInnerClassName="t-sticky-tool-popup-content"
          >
            <ng-container *ngTemplateOutlet="stickyItem; context: { $implicit: item }" />
            <div tPopupContent>
              <ng-container *ngTemplateOutlet="renderNode; context: { $implicit: item.popup }" />
            </div>
          </t-popup>
        } @else {
          <ng-container *ngTemplateOutlet="stickyItem; context: { $implicit: item }" />
        }
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    // 宿主只做包裹，样式全在内部的 `t-sticky-tool` 上（与上游一致），因此类名固定为空。
    '[class]': 'classes()',
  },
})
export class TStickyTool {
  /**
   * 悬浮项列表。
   * @zh 悬浮项列表 @en list of sticky items @defaultValue []
   */
  readonly list = input<StickyToolItem[]>([]);

  /**
   * 相对默认位置的偏移增量，依次为 `[水平, 垂直]`：数字与基础偏移（80 / 24）相加，字符串写进 `calc()`。
   * @zh 偏移 @en offset
   */
  readonly offset = input<Array<string | number> | undefined>(undefined);

  /**
   * 停靠位置。
   * @zh 停靠位置 @en placement @defaultValue right-bottom @values right-top,right-center,right-bottom,left-top,left-center,left-bottom
   */
  readonly placement = input<StickyToolPlacement>('right-bottom');

  /**
   * 形状。
   * @zh 形状 @en shape @defaultValue square @values square,round
   */
  readonly shape = input<StickyToolShape>('square');

  /**
   * 展示形式，`compact` 更小且不渲染文案。
   * @zh 展示形式 @en type @defaultValue normal @values normal,compact
   */
  readonly type = input<StickyToolType>('normal');

  /**
   * 整体宽度，设置后子项按宽度居中。
   * @zh 宽度 @en width
   */
  readonly width = input<string | number | undefined>(undefined);

  /**
   * 子项点击，`item` 为被点击的悬浮项。
   * @zh 子项点击 @en item click
   */
  readonly itemClick = output<StickyToolItemEvent>();

  /**
   * 子项悬浮，`item` 为被悬浮的悬浮项。
   * @zh 子项悬浮 @en item hover
   */
  readonly itemHover = output<StickyToolItemEvent>();

  /** 宿主的类名固定为空，宿主只做包裹。 */
  protected readonly classes = computed(() => '');

  /** 根节点类名，与上游一致：基础类 + 形状修饰类。 */
  protected readonly rootClasses = computed(() =>
    ['t-sticky-tool', `t-sticky-tool--${this.shape()}`].join(' '),
  );

  /** 根节点内联样式：位置（含居中段）+ 宽度。 */
  protected readonly rootStyle = computed<Record<string, string>>(() => {
    const [horizontal, vertical] = this.offsetValues();
    const style: Record<string, string> = {};
    this.placement()
      .split('-')
      .forEach((segment, index) => {
        if (segment === 'center') {
          // 居中段：水平方向仍按 placement 落脚，垂直方向靠 50% + 位移居中。
          style['top'] = '50%';
          style['transform'] = 'translate(0, -50%)';
          return;
        }
        style[segment] = index === 0 ? horizontal : vertical;
      });
    const width = this.widthValue();
    if (width) {
      style['width'] = width;
    }
    return style;
  });

  /** 子项类名：基础类 + 展示形式 + 形状。 */
  protected readonly itemClasses = computed(() =>
    ['t-sticky-item', `t-sticky-item--${this.type()}`, `t-sticky-item--${this.shape()}`].join(' '),
  );

  /** 子项内联样式：设置宽度后按（宽度 - 子项尺寸）/ 2 居中。 */
  protected readonly itemStyle = computed<Record<string, string>>(() => {
    const style: Record<string, string> = {};
    const width = this.widthValue();
    if (!width) {
      return style;
    }
    const size = this.type() === 'normal' ? 56 : 40;
    style['margin'] = `calc((${width} - ${size}px)/2)`;
    return style;
  });

  /** 弹层位置：贴右侧时向左弹，否则向右弹（与上游一致）。 */
  protected readonly popupPlacement = computed(() =>
    this.placement().includes('right') ? 'left' : 'right',
  );

  /** 判断一个取值是不是模板，模板用 `*ngTemplateOutlet` 渲染，其余按文本渲染。 */
  protected asTemplate(value: StickyToolNode): TemplateRef<unknown> | null {
    return value instanceof TemplateRef ? value : null;
  }

  /** 子项点击：派发带 `item` 上下文的 `(itemClick)`。 */
  protected handleItemClick(event: MouseEvent, item: StickyToolItem): void {
    this.itemClick.emit({ e: event, item });
  }

  /** 子项悬浮：派发带 `item` 上下文的 `(itemHover)`。 */
  protected handleItemHover(event: MouseEvent, item: StickyToolItem): void {
    this.itemHover.emit({ e: event, item });
  }

  /** 基础偏移：水平 80px、垂直 24px，再叠加 `offset` 的增量。 */
  private readonly offsetValues = computed<[string, string]>(() => {
    const offset = this.offset() ?? [];
    return [this.offsetValue(80, offset[0]), this.offsetValue(24, offset[1])];
  });

  /** 宽度归一化：数字补 `px`，空值返回 `null`。 */
  private widthValue(): string | null {
    const width = this.width();
    if (width === undefined || width === null || width === '') {
      return null;
    }
    return typeof width === 'number' ? `${width}px` : String(width);
  }

  /** 单个方向的偏移：数字与基础值相加，字符串交给 `calc()`。 */
  private offsetValue(base: number, value: string | number | undefined): string {
    if (value === undefined || value === null || value === '') {
      return `${base}px`;
    }
    const numeric = Number(value);
    if (!Number.isNaN(numeric)) {
      return `${base + numeric}px`;
    }
    return `calc(${base}px + ${value})`;
  }
}
