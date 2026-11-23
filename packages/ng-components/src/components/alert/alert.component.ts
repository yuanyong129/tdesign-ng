import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  TemplateRef,
  ViewEncapsulation,
  computed,
  inject,
  input,
  numberAttribute,
  output,
  signal,
} from '@angular/core';

/** 警告提示主题。 */
export const ALERT_THEMES = ['success', 'info', 'warning', 'error'] as const;
export type AlertTheme = (typeof ALERT_THEMES)[number];

/** 警告提示里的富文本属性：字符串按文本渲染，`TemplateRef` 交给 `*ngTemplateOutlet` 渲染。 */
export type AlertContent = string | TemplateRef<unknown> | undefined;

/** 点击关闭按钮时的事件参数，与上游 `onClose` 的 `{ e }` 对齐。 */
export interface AlertCloseEvent {
  e: MouseEvent;
}

/** 关闭动画结束时的事件参数，与上游 `onClosed` 的 `{ e }` 对齐。 */
export interface AlertClosedEvent {
  e: Event;
}

/** 关闭动画时长，与 less 里 `.t-alert` 的 `transition: opacity 0.2s` 保持一致。 */
const CLOSE_ANIMATION_MS = 200;

/** 过渡事件的兜底延时：样式没加载或被禁用 `transition` 时靠它收尾。 */
const CLOSE_FALLBACK_MS = CLOSE_ANIMATION_MS + 60;

/**
 * 警告提示。
 *
 * 视觉样式全部来自 tdesign-common（`@tdesign-ng/styles`），组件只负责结构与修饰类：
 * 宿主本身就是 `.t-alert`，内部按上游顺序排布图标、内容（标题 + 正文）、操作区与关闭按钮。
 * 关闭时先加 `t-alert--closing` 淡出，动画结束后再加 `t-is-hidden` 隐藏，
 * 与上游 `onClose` / `onClosed` 的时机一致。
 *
 * 淡出/隐藏的类名与时长以 vendor less 为准：
 * `vendor/tdesign-common/style/web/components/alert/_index.less:12-29`
 * （`.t-alert` 的 `transition: opacity .2s`、`.t-alert--closing{opacity:0}`、`.t-alert.t-is-hidden{display:none}`）。
 */
@Component({
  selector: 't-alert',
  standalone: true,
  imports: [NgTemplateOutlet],
  template: `
    <!-- 富文本属性统一渲染入口：模板走 ngTemplateOutlet，其余按文本输出（等价于上游的 renderTNodeJSX）。 -->
    <ng-template #renderNode let-value>
      @if (asTemplate(value); as template) {
        <ng-container *ngTemplateOutlet="template" />
      } @else if (value) {
        {{ value }}
      }
    </ng-template>

    <div class="t-alert__icon">
      @if (icon()) {
        <ng-container *ngTemplateOutlet="renderNode; context: { $implicit: icon() }" />
      } @else {
        @switch (theme()) {
          @case ('success') {
            <svg
              class="t-icon t-icon-check-circle-filled"
              viewBox="0 0 24 24"
              width="1em"
              height="1em"
              aria-hidden="true"
            >
              <path
                fill="currentColor"
                d="M12 23C18.0751 23 23 18.0751 23 12C23 5.92487 18.0751 1 12 1C5.92487 1 1 5.92487 1 12C1 18.0751 5.92487 23 12 23ZM7.49985 10.5858L10.4999 13.5858L16.4999 7.58578L17.9141 8.99999L10.4999 16.4142L6.08564 12L7.49985 10.5858Z"
              />
            </svg>
          }
          @case ('warning') {
            <svg
              class="t-icon t-icon-error-circle-filled"
              viewBox="0 0 24 24"
              width="1em"
              height="1em"
              aria-hidden="true"
            >
              <path
                fill="currentColor"
                d="M12 1C18.0751 1 23 5.92487 23 12C23 18.0751 18.0751 23 12 23C5.92487 23 1 18.0751 1 12C1 5.92487 5.92487 1 12 1ZM11.0001 14H13.0001V6.49998H11.0001V14ZM13.004 15.5H11.0001V17.5039H13.004V15.5Z"
              />
            </svg>
          }
          @case ('error') {
            <svg
              class="t-icon t-icon-error-circle-filled"
              viewBox="0 0 24 24"
              width="1em"
              height="1em"
              aria-hidden="true"
            >
              <path
                fill="currentColor"
                d="M12 1C18.0751 1 23 5.92487 23 12C23 18.0751 18.0751 23 12 23C5.92487 23 1 18.0751 1 12C1 5.92487 5.92487 1 12 1ZM11.0001 14H13.0001V6.49998H11.0001V14ZM13.004 15.5H11.0001V17.5039H13.004V15.5Z"
              />
            </svg>
          }
          @default {
            <svg class="t-icon t-icon-info-circle-filled" viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true">
              <path
                fill="currentColor"
                d="M12 23C18.0751 23 23 18.0751 23 12C23 5.92487 18.0751 1 12 1C5.92487 1 1 5.92487 1 12C1 18.0751 5.92487 23 12 23ZM10.996 8.50002V6.49611H12.9999V8.50002H10.996ZM12.9999 10L12.9999 17.5H10.9999V10L12.9999 10Z"
              />
            </svg>
          }
        }
      }
    </div>

    <div class="t-alert__content">
      @if (title()) {
        <div class="t-alert__title">
          <ng-container *ngTemplateOutlet="renderNode; context: { $implicit: title() }" />
        </div>
      }
      <div class="t-alert__message">
        <div class="t-alert__description" [style]="descriptionStyle()">
          @if (message()) {
            <ng-container *ngTemplateOutlet="renderNode; context: { $implicit: message() }" />
          } @else {
            <ng-content />
          }
        </div>
      </div>
    </div>

    @if (operation()) {
      <div class="t-alert__operation">
        <ng-container *ngTemplateOutlet="renderNode; context: { $implicit: operation() }" />
      </div>
    }

    @if (showClose()) {
      <div class="t-alert__close" (click)="handleCloseClick($event)">
        @if (closeText()) {
          {{ closeText() }}
        } @else {
          <svg class="t-icon t-icon-close" viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true">
            <path
              fill="none"
              stroke="currentColor"
              stroke-linecap="square"
              stroke-width="2"
              d="M16.9503 7.05029L12.0005 12M12.0005 12L7.05078 16.9498M12.0005 12L16.9503 16.9498M12.0005 12L7.05078 7.05029"
            />
          </svg>
        }
      </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'classes()',
    '(transitionend)': 'handleTransitionEnd($event)',
  },
})
export class TAlert {
  /**
   * 关闭按钮：`true` 显示默认关闭图标，字符串作为按钮文案。
   *
   * 上游的 `close` 属性与 `onClose` 事件在 Angular 侧分别对应 `[close]` 与 `(close)`，
   * 同一个类成员不能既做输入又做输出，所以输入用 `alias` 挂在本属性上，
   * 下面的同名 signal output 提供 `(close)`，两者的公共名都是 `close`。
   * @zh 关闭按钮 @en close button @defaultValue false
   */
  readonly closeConfig = input<string | boolean>(false, { alias: 'close' });

  /** 是否显示关闭按钮，优先级高于 `close`。 @zh 是否显示关闭按钮 @en close button visibility @defaultValue false */
  readonly closeBtn = input<string | boolean>(false);

  /** 自定义图标，字符串按文本渲染，也可以传入模板。 @zh 自定义图标 @en icon */
  readonly icon = input<AlertContent>(undefined);

  /** 消息正文最多显示的行数，`0` 表示不限制。 @zh 消息最多行数 @en max line @defaultValue 0 */
  readonly maxLine = input(0, { transform: numberAttribute });

  /** 消息正文，未设置时使用投影内容。 @zh 消息正文 @en message */
  readonly message = input<AlertContent>(undefined);

  /** 操作区内容，显示在正文右侧。 @zh 操作区 @en operation */
  readonly operation = input<AlertContent>(undefined);

  /** 主题。 @zh 主题 @en theme @defaultValue info @values success,info,warning,error */
  readonly theme = input<AlertTheme>('info');

  /** 标题。 @zh 标题 @en title */
  readonly title = input<AlertContent>(undefined);

  /** 点击关闭按钮时触发，参数为原始鼠标事件。 @zh 点击关闭按钮 @en close */
  readonly close = output<AlertCloseEvent>();

  /** 关闭动画结束后触发，此时宿主已加上 `t-is-hidden`。 @zh 关闭动画结束 @en closed */
  readonly closed = output<AlertClosedEvent>();

  private readonly hostEl = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly destroyRef = inject(DestroyRef);

  /** 淡出动画进行中，宿主带 `t-alert--closing`。 */
  private readonly closing = signal(false);

  /** 关闭动画已结束，宿主带 `t-is-hidden`（DOM 仍保留，与上游一致）。 */
  private readonly hidden = signal(false);

  private closeTimer: ReturnType<typeof setTimeout> | null = null;

  protected readonly classes = computed(() => {
    const classes = ['t-alert', `t-alert--${this.theme()}`];
    if (this.closing()) {
      classes.push('t-alert--closing');
    }
    if (this.hidden()) {
      classes.push('t-is-hidden');
    }
    return classes.join(' ');
  });

  /** `maxLine` 大于 0 时用 -webkit-line-clamp 截断正文，上游的 `__description` 负责颜色与高度过渡。 */
  protected readonly descriptionStyle = computed<Record<string, string> | null>(() => {
    const maxLine = this.maxLine();
    if (!Number.isFinite(maxLine) || maxLine <= 0) {
      return null;
    }
    return {
      display: '-webkit-box',
      '-webkit-box-orient': 'vertical',
      '-webkit-line-clamp': `${maxLine}`,
      overflow: 'hidden',
    };
  });

  /** 关闭按钮的配置值：`closeBtn` 优先于 `close`，两者都是 `false` 时不渲染关闭按钮。 */
  private readonly closeButtonValue = computed<string | boolean>(() => this.closeBtn() || this.closeConfig());

  /** 是否渲染关闭按钮。 */
  protected readonly showClose = computed(() => !!this.closeButtonValue());

  /** 关闭按钮的文案：配置是字符串时作为文案，`true` 时用默认关闭图标。 */
  protected readonly closeText = computed(() => {
    const value = this.closeButtonValue();
    return typeof value === 'string' ? value : '';
  });

  constructor() {
    this.destroyRef.onDestroy(() => this.clearCloseTimer());
  }

  /** 判断一个取值是不是模板，模板用 `*ngTemplateOutlet` 渲染，其余按文本渲染。 */
  protected asTemplate(value: AlertContent): TemplateRef<unknown> | null {
    return value instanceof TemplateRef ? value : null;
  }

  /** 点击关闭按钮：先派发 `(close)`，再加淡出类，动画结束后隐藏并派发 `(closed)`。 */
  protected handleCloseClick(event: MouseEvent): void {
    if (this.closing() || this.hidden()) {
      return;
    }
    this.close.emit({ e: event });
    this.closing.set(true);
    this.clearCloseTimer();
    this.closeTimer = setTimeout(() => this.finishClose(new Event('transitionend')), CLOSE_FALLBACK_MS);
  }

  /** 宿主上监听 `transitionend`，只认宿主自身 opacity 过渡结束，忽略子节点的过渡冒泡。 */
  protected handleTransitionEnd(event: Event): void {
    if (!this.closing() || this.hidden()) {
      return;
    }
    if (event.target !== this.hostEl.nativeElement) {
      return;
    }
    if ((event as TransitionEvent).propertyName !== 'opacity') {
      return;
    }
    this.finishClose(event);
  }

  private finishClose(event: Event): void {
    this.clearCloseTimer();
    if (this.hidden()) {
      return;
    }
    this.closing.set(false);
    this.hidden.set(true);
    this.closed.emit({ e: event });
  }

  private clearCloseTimer(): void {
    if (this.closeTimer === null) {
      return;
    }
    clearTimeout(this.closeTimer);
    this.closeTimer = null;
  }
}
