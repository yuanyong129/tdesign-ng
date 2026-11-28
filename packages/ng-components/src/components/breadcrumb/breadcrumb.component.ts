import { NgTemplateOutlet } from '@angular/common';
import { PortalModule } from '@angular/cdk/portal';
import { ChangeDetectionStrategy, Component, Injector, ViewEncapsulation, afterNextRender, computed, contentChildren, effect, forwardRef, inject, input, signal, untracked, viewChild, viewChildren } from '@angular/core';
import { TPopup } from '../popup/popup.component';
import { isTemplateContent } from '../../_utils/content';
import {
  T_BREADCRUMB,
  TBreadcrumbItem,
  type BreadcrumbContent,
  type BreadcrumbHost,
  type BreadcrumbTarget,
} from './breadcrumb-item.component';

/** 面包屑主题。上游只有 `light` 一种，且没有对应样式规则。 */
export const BREADCRUMB_THEMES = ['light'] as const;
/** 面包屑主题取值。 */
export type BreadcrumbTheme = (typeof BREADCRUMB_THEMES)[number];

/** `options` 里一项的数据形状，路由字段留待独立路由整合。 */
export interface BreadcrumbOption {
  /** 面包屑内容，等价于子项的 `content`。 */
  content?: BreadcrumbContent;
  /** 默认插槽内容，`content` 未设置时使用。 */
  default?: BreadcrumbContent;
  /** 是否禁用。 */
  disabled?: boolean;
  /** 跳转链接。 */
  href?: string;
  /** 前缀图标。 */
  icon?: BreadcrumbContent;
  /** 内容最大宽度。 */
  maxWidth?: string;
  /** 链接打开位置。 */
  target?: BreadcrumbTarget;
  /** 点击未禁用的选项；可调用 preventDefault 取消原生导航。 */
  onClick?: (e: MouseEvent) => void;
}

export interface BreadcrumbEllipsisContext {
  /** 被折叠项的描述；投影文字使用实时测量文本，原组件通过默认弹层访问。 */
  items: BreadcrumbOption[];
  separator: BreadcrumbContent;
}

let breadcrumbUid = 0;

/**
 * 面包屑。
 *
 * 宿主元素就是 `.t-breadcrumb`（`display: flex`），子项 `t-breadcrumb-item` 直接投影进来参与
 * flex 布局，因此不需要 ng-template 逐个重排（`vendor/tdesign-common/style/web/components/breadcrumb/_index.less:11`）。
 * 分隔符与 `maxItemWidth` 通过 DI 令牌 `T_BREADCRUMB` 下发给子项，对应上游
 * `provide('tBreadcrumb', { separator, theme, maxItemWidth })`。
 *
 * 折叠项通过 Popup + DomPortal 移动原宿主，保持投影事件与内部状态。
 */
@Component({
  selector: 't-breadcrumb',
  standalone: true,
  imports: [TBreadcrumbItem, NgTemplateOutlet, PortalModule, TPopup],
  template: `
    @for (option of normalizedOptions(); track option) {
      <t-breadcrumb-item
        [content]="option.content ?? option.default"
        [disabled]="option.disabled ?? false"
        [href]="option.href"
        [icon]="option.icon"
        [maxWidth]="option.maxWidth"
        [target]="option.target"
        (click)="handleOptionClick($event, option)"
      />
    }
    <ng-content />
    @if (collapsedItems().length) {
      <t-popup #popup class="t-breadcrumb__item" [style.order]="collapseRange().before * 2 - 1"
        trigger="click" placement="bottom-left" [showArrow]="false" destroyOnClose
        overlayClassName="t-breadcrumb__collapsed-popup" (visibleChange)="handlePopupVisibleChange($event)">
        <span #trigger class="t-breadcrumb__select-item" role="button" tabindex="0" aria-haspopup="true"
          [attr.aria-expanded]="popupVisible()" [attr.aria-controls]="overflowId"
          [attr.aria-label]="'显示折叠的 ' + collapsedItems().length + ' 个路径'"
          (keydown)="handleTriggerKeydown($event, popup)">
          @if (ellipsis(); as content) {
            @if (isTemplateContent(content)) {
              <ng-container [ngTemplateOutlet]="content" [ngTemplateOutletContext]="ellipsisContext()" />
            } @else { {{ content }} }
          } @else {
            <svg class="t-icon" viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true"><circle cx="5" cy="12" r="1.5" fill="currentColor"/><circle cx="12" cy="12" r="1.5" fill="currentColor"/><circle cx="19" cy="12" r="1.5" fill="currentColor"/></svg>
          }
        </span>
        <span class="t-breadcrumb__separator" style="display:flex" aria-hidden="true">
          @if (isTemplateContent(separator())) {
            <ng-container [ngTemplateOutlet]="separatorTemplate()" />
          } @else if (separator()) { {{ separator() }} } @else {
            <svg class="t-icon" viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true"><path fill="none" stroke="currentColor" stroke-width="2" d="M9.5 17.5L15 12L9.5 6.5" /></svg>
          }
        </span>
        <div tPopupContent class="t-breadcrumb" data-t-breadcrumb-overflow role="group" aria-label="折叠路径" [id]="overflowId"
          (keydown)="handlePanelKeydown($event, popup, trigger)" (focusout)="handlePanelBlur($event, popup)">
          @for (item of collapsedItems(); track item) {
            <ng-container [cdkPortalOutlet]="item.collapsePortal" />
          }
        </div>
      </t-popup>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'classes()',
    'role': 'navigation',
    'aria-label': '面包屑',
  },
  providers: [
    {
      provide: T_BREADCRUMB,
      useExisting: forwardRef(() => TBreadcrumb),
    },
  ],
})
export class TBreadcrumb implements BreadcrumbHost {
  /** @zh 折叠处的内容，模板上下文包含 items 和 separator @en Collapse trigger content, with items and separator in template context @defaultValue undefined */
  readonly ellipsis = input<BreadcrumbContent>(undefined);
  /** @zh 折叠前保留的项目数，必须与后置数量同时为正数 @en Number of items before the collapse, both counts must be positive @defaultValue undefined */
  readonly itemsBeforeCollapse = input<number | undefined>(undefined);
  /** @zh 折叠后保留的项目数 @en Number of items after the collapse @defaultValue undefined */
  readonly itemsAfterCollapse = input<number | undefined>(undefined);
  /** @zh 超过该数量时折叠，未设置或非正数不折叠 @en Collapse when item count exceeds this positive threshold @defaultValue undefined */
  readonly maxItems = input<number | undefined>(undefined);
  protected readonly overflowId = `t-breadcrumb-overflow-${++breadcrumbUid}`;
  protected readonly isTemplateContent = isTemplateContent;
  private readonly projectedItems = contentChildren(TBreadcrumbItem);
  private readonly optionItems = viewChildren(TBreadcrumbItem);
  private readonly injector = inject(Injector);
  private readonly popup = viewChild<TPopup>('popup');
  protected readonly popupVisible = signal(false);
  /** 子项未设置 `maxWidth` 时的兜底最大宽度，默认 120px。 @zh 最大宽度 @en max item width */
  readonly maxItemWidth = input<string | undefined>(undefined);

  /** 数据驱动项排在投影子项之前，两者共同参与折叠。 @zh 选项列表 @en options */
  readonly options = input<BreadcrumbOption[] | undefined>(undefined);

  /** 分隔符，字符串按文本渲染，也可以传入模板；未设置时渲染默认的右箭头图标。 @zh 分隔符 @en separator */
  readonly separator = input<BreadcrumbContent>(undefined);

  /** 主题，上游只支持 `light`，该值不会产生类名（上游把主题当裸类名拼在子项上，样式表里并无对应选择器）。 @zh 主题 @en theme @defaultValue light @values light */
  readonly theme = input<BreadcrumbTheme>('light');

  /** 宿主类名。 */
  protected readonly classes = computed(() => 't-breadcrumb');

  /** `@for` 需要一个稳定的可迭代对象，避免每次变更检测都新建数组。 */
  protected readonly normalizedOptions = computed<BreadcrumbOption[]>(() => this.options() ?? []);

  private readonly allItems = computed(() => [...this.optionItems(), ...this.projectedItems()]);
  protected readonly collapseRange = computed(() => {
    const count = (value: number | undefined) => value !== undefined && Number.isFinite(value) && value > 0 ? Math.floor(value) : 0;
    const before = count(this.itemsBeforeCollapse()), after = count(this.itemsAfterCollapse()), max = count(this.maxItems());
    const total = this.allItems().length;
    return { before, after, collapsed: max > 0 && before > 0 && after > 0 && total > max && before + after < total };
  });
  protected readonly collapsedItems = computed(() => {
    const range = this.collapseRange(), items = this.allItems();
    return range.collapsed ? items.slice(range.before, items.length - range.after) : [];
  });
  protected readonly separatorTemplate = computed(() => {
    const content = this.separator(); return isTemplateContent(content) ? content : null;
  });
  protected readonly ellipsisContext = computed<BreadcrumbEllipsisContext>(() => ({
    items: this.collapsedItems().map((item) => ({ content: item.content() ?? item.textValue(), disabled: item.disabled(),
      href: item.href(), icon: item.icon(), maxWidth: item.maxWidth(), target: item.target(),
      onClick: this.normalizedOptions()[this.optionItems().indexOf(item)]?.onClick })),
    separator: this.separator(),
  }));

  constructor() {
    effect((cleanup) => {
      const items = this.allItems(), hidden = new Set(this.collapsedItems());
      this.normalizedOptions();
      untracked(() => {
        if (this.popup()?.isVisible()) this.popup()?.hide();
        items.forEach((item, index) => item.setBreadcrumbState(hidden.has(item), index * 2, index === items.length - 1));
      });
      cleanup(() => untracked(() => items.forEach((item) => item.setBreadcrumbState(false, null, false))));
    });
  }

  protected handleOptionClick(event: MouseEvent, option: BreadcrumbOption): void {
    if (!option.disabled) option.onClick?.(event);
  }

  protected handlePanelBlur(event: FocusEvent, popup: TPopup): void {
    if (!popup.containsTarget(event.relatedTarget)) popup.hide();
  }

  protected handlePopupVisibleChange(visible: boolean): void {
    this.popupVisible.set(visible);
    if (!visible) this.collapsedItems().forEach((item) => item.closeTooltip());
  }

  protected handleTriggerKeydown(event: KeyboardEvent, popup: TPopup): void {
    if (event.target !== event.currentTarget) return;
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault(); popup.toggle();
    } else if (event.key === 'ArrowDown') {
      event.preventDefault(); popup.show();
      const trigger = event.currentTarget as HTMLElement;
      afterNextRender(() => this.panelLinks(trigger)[0]?.focus(), { injector: this.injector });
    } else if (event.key === 'Escape') {
      event.preventDefault(); popup.hide();
    }
  }

  protected handlePanelKeydown(event: KeyboardEvent, popup: TPopup, trigger: HTMLElement): void {
    if (event.key === 'Escape') {
      event.preventDefault(); event.stopPropagation(); popup.hide(); trigger.focus(); return;
    }
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
    const links = this.panelLinks(trigger), current = links.indexOf(event.target as HTMLElement);
    if (current < 0 || !links.length) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? links.length - 1
      : (current + (event.key === 'ArrowDown' ? 1 : -1) + links.length) % links.length;
    links[next].focus();
  }

  private panelLinks(trigger: HTMLElement): HTMLElement[] {
    return Array.from(trigger.ownerDocument.getElementById(this.overflowId)?.querySelectorAll<HTMLElement>('a[href],button:not(:disabled),[tabindex="0"]') ?? []);
  }
}
