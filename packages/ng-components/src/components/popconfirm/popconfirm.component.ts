import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  ViewEncapsulation,
  afterNextRender,
  booleanAttribute,
  computed,
  effect,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { TButton } from '../button/button.component';
import type { ButtonSize, ButtonTheme, ButtonVariant } from '../button/button.types';
import { TPopup } from '../popup/popup.component';
import { POPUP_PLACEMENTS, mergePopupClassNames, type PopupOptions, type PopupPlacement } from '../popup/popup.types';
import type { Content } from '../../_utils/content';

/** 气泡确认框的主题，决定图标与确认按钮的主题色。 */
export const POPCONFIRM_THEMES = ['default', 'warning', 'danger'] as const;

export type PopconfirmTheme = (typeof POPCONFIRM_THEMES)[number];

/** 气泡确认框的弹出位置，与 `t-popup` 的 12 个方向一致。 */
export const POPCONFIRM_PLACEMENTS = POPUP_PLACEMENTS;

export type PopconfirmPlacement = PopupPlacement;

/** 关闭气泡确认框的来源，与上游 `TriggerSource` 对齐。 */
export const POPCONFIRM_TRIGGER_SOURCES = ['cancel', 'confirm', 'document', 'trigger-element-click'] as const;

export type PopconfirmTriggerSource = (typeof POPCONFIRM_TRIGGER_SOURCES)[number];

/** 气泡确认框的富文本内容：字符串按文本渲染，`TemplateRef` 交给 `ngTemplateOutlet` 渲染。 */
export type PopconfirmContent = Content;

/** 按钮配置，与上游 `ButtonProps` 里本组件会用到的字段对齐。 */
export interface PopconfirmButtonProps {
  /** 按钮文字或自定义模板 */
  content?: string | TemplateRef<unknown>;
  /** 按钮主题色 */
  theme?: ButtonTheme;
  /** 按钮变体 */
  variant?: ButtonVariant;
  /** 按钮尺寸 */
  size?: ButtonSize;
  /** 是否禁用 */
  disabled?: boolean;
  /** 是否处于加载状态 */
  loading?: boolean;
}

/** 操作按钮：字符串为文字，对象为按钮配置，模板为自定义内容，`null` 表示不渲染该按钮。 */
export type PopconfirmButton = string | TemplateRef<unknown> | PopconfirmButtonProps | null | undefined;

/** 点击确定/取消按钮时携带的事件参数，与上游 `{ e }` 对齐。 */
export interface PopconfirmActionEvent {
  /** 原生鼠标事件 */
  e: MouseEvent;
}

/** 展开状态变化时携带的上下文，与上游 `PopconfirmVisibleChangeContext` 对齐。 */
export interface PopconfirmVisibleChangeEvent {
  /** 变化后的展开状态 */
  visible: boolean;
  /** 触发这次变化的来源 */
  trigger: PopconfirmTriggerSource;
  /** 触发这次变化的事件，程序化关闭时为空 */
  e?: MouseEvent;
}

/** 上游：`theme` 决定确认按钮的主题色（对应 `config-provider` 的 `confirmBtnTheme` 默认值）。 */
const CONFIRM_BUTTON_THEMES: Record<PopconfirmTheme, ButtonTheme> = {
  default: 'primary',
  warning: 'warning',
  danger: 'danger',
};

const DEFAULT_CONFIRM_TEXT = '确定';

const DEFAULT_CANCEL_TEXT = '取消';

/** 上游 `InfoCircleFilledIcon`（tdesign-icons `info-circle-filled`）的路径。 */
const INFO_ICON_PATH =
  'M12 23C18.0751 23 23 18.0751 23 12C23 5.92487 18.0751 1 12 1C5.92487 1 1 5.92487 1 12C1 18.0751 5.92487 23 12 23ZM10.996 8.50002V6.49611H12.9999V8.50002H10.996ZM12.9999 10L12.9999 17.5H10.9999V10L12.9999 10Z';

/** 上游 `ErrorCircleFilledIcon`（tdesign-icons `error-circle-filled`）的路径。 */
const ERROR_ICON_PATH =
  'M12 1C18.0751 1 23 5.92487 23 12C23 18.0751 18.0751 23 12 23C5.92487 23 1 18.0751 1 12C1 5.92487 5.92487 1 12 1ZM11.0001 14H13.0001V6.49998H11.0001V14ZM13.004 15.5H11.0001V17.5039H13.004V15.5Z';

function isTemplate(value: unknown): value is TemplateRef<unknown> {
  return value instanceof TemplateRef;
}

/**
 * 气泡确认框。
 *
 * 由 `t-popup` 承载弹层定位与展开状态：触发器默认投影 `<t-popconfirm>` 的内容，
 * 也可以用 `triggerElement` 传入文字或模板；确认区由组件按上游 DOM 拼装，
 * 视觉样式全部来自 tdesign-common（`@tdesign-ng/styles`）。
 *
 * 触发器必须是「有盒子」的元素：`t-popup` 用宿主元素的第一个元素子节点当定位锚点，
 * 而 `t-button` 这类组件的宿主是 `display: contents`（没有盒子），所以外面要包一层 `<span>`。
 *
 * ```html
 * <t-popconfirm content="确认删除该项？" (confirm)="onConfirm()">
 *   <span><t-button theme="danger" variant="outline">删除</t-button></span>
 * </t-popconfirm>
 * ```
 */
@Component({
  selector: 't-popconfirm',
  standalone: true,
  imports: [NgTemplateOutlet, TButton, TPopup],
  templateUrl: './popconfirm.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class TPopconfirm {
  /** 取消按钮，字符串为文字、对象为按钮配置、模板为自定义内容，`null` 表示不渲染。 @zh 取消按钮 @en cancel button @defaultValue '' */
  readonly cancelBtn = input<PopconfirmButton>('');

  /** 确认按钮，字符串为文字、对象为按钮配置（可传 `loading` 做异步提交）、模板为自定义内容，`null` 表示不渲染。 @zh 确认按钮 @en confirm button @defaultValue '' */
  readonly confirmBtn = input<PopconfirmButton>('');

  /** 确认框内容，字符串按文本渲染，也可以传入模板。 @zh 确认框内容 @en popconfirm content @defaultValue undefined */
  readonly content = input<PopconfirmContent>(undefined);

  /** 关闭时是否销毁弹层内容。 @zh 关闭时是否销毁弹层内容 @en destroy on close @defaultValue true */
  readonly destroyOnClose = input(true, { transform: booleanAttribute });

  /** 自定义图标，不传时按 `theme` 使用内置图标。 @zh 自定义图标 @en custom icon @defaultValue undefined */
  readonly icon = input<PopconfirmContent>(undefined);

  /** 弹层位置。 @zh 弹层位置 @en popup placement @defaultValue 'top' @values top,left,right,bottom,top-left,top-right,bottom-left,bottom-right,left-top,left-bottom,right-top,right-bottom */
  readonly placement = input<PopconfirmPlacement>('top');

  /** 透传给弹层的选项（`delay` / `zIndex` / `overlayClassName` 等）；`placement` / `showArrow` / `destroyOnClose` 以本组件显式属性为准。 @zh 弹层透传选项 @en popup options @defaultValue undefined */
  readonly popupProps = input<PopupOptions | undefined>(undefined);

  /** 是否显示弹层箭头。 @zh 是否显示箭头 @en show arrow @defaultValue true */
  readonly showArrow = input(true, { transform: booleanAttribute });

  /** 主题，`warning` / `danger` 会把图标换成警示图标，并同步确认按钮的主题色。 @zh 主题 @en theme @defaultValue 'default' @values default,warning,danger */
  readonly theme = input<PopconfirmTheme>('default');

  /** 触发元素，不投影内容时用它做触发器（文字或模板）。 @zh 触发元素 @en trigger element @defaultValue undefined */
  readonly triggerElement = input<PopconfirmContent>(undefined);

  /** 受控的展开状态，传入后组件不再自己关闭弹层，只通过 `visibleChange` 通知。 @zh 受控展开状态 @en controlled visible @defaultValue undefined */
  readonly visible = input<boolean | undefined>(undefined);

  /** 非受控时的初始展开状态。 @zh 默认是否展开 @en default visible @defaultValue false */
  readonly defaultVisible = input(false, { transform: booleanAttribute });

  /** 点击确认按钮，参数为 `{ e }`。 @zh 点击确认 @en confirm */
  readonly confirm = output<PopconfirmActionEvent>();

  /** 点击取消按钮，参数为 `{ e }`。 @zh 点击取消 @en cancel */
  readonly cancel = output<PopconfirmActionEvent>();

  /** 展开状态变化，参数为 `{ visible, trigger, e }`。 @zh 展开状态变化 @en visible change */
  readonly visibleChange = output<PopconfirmVisibleChangeEvent>();

  protected readonly innerVisible = signal(false);

  /**
   * 弹层选项：`popupProps` 打底，本组件的显式属性覆盖同名键。
   * `overlayClassName` 保留组件自身的 `t-popconfirm` 语义类，再叠加用户传入的类名。
   */
  protected readonly popupOptions = computed<PopupOptions>(() => {
    const passthrough = this.popupProps() ?? {};
    return {
      ...passthrough,
      placement: this.placement(),
      showArrow: this.showArrow(),
      destroyOnClose: this.destroyOnClose(),
      overlayClassName: mergePopupClassNames('t-popconfirm', passthrough.overlayClassName),
    };
  });

  protected readonly showCancel = computed(() => this.cancelBtn() !== null);

  protected readonly showConfirm = computed(() => this.confirmBtn() !== null);

  protected readonly showButtons = computed(() => this.showCancel() || this.showConfirm());

  protected readonly cancelButtonProps = computed(() =>
    this.resolveButtonProps({ theme: 'default', size: 'small' }, this.cancelBtn()),
  );

  protected readonly confirmButtonProps = computed(() =>
    this.resolveButtonProps({ theme: CONFIRM_BUTTON_THEMES[this.theme()] ?? 'primary', size: 'small' }, this.confirmBtn()),
  );

  protected readonly cancelTemplate = computed(() => this.templateOfButton(this.cancelBtn(), this.cancelButtonProps()));

  protected readonly confirmTemplate = computed(() =>
    this.templateOfButton(this.confirmBtn(), this.confirmButtonProps()),
  );

  protected readonly cancelText = computed(() => this.textOfButton(this.cancelButtonProps(), DEFAULT_CANCEL_TEXT));

  protected readonly confirmText = computed(() => this.textOfButton(this.confirmButtonProps(), DEFAULT_CONFIRM_TEXT));

  protected readonly contentTemplate = computed(() => {
    const value = this.content();
    return isTemplate(value) ? value : null;
  });

  protected readonly contentText = computed(() => {
    const value = this.content();
    return typeof value === 'string' ? value : '';
  });

  protected readonly iconTemplate = computed(() => {
    const value = this.icon();
    return isTemplate(value) ? value : null;
  });

  protected readonly iconText = computed(() => {
    const value = this.icon();
    return typeof value === 'string' ? value : '';
  });

  protected readonly triggerTemplate = computed(() => {
    const value = this.triggerElement();
    return isTemplate(value) ? value : null;
  });

  protected readonly triggerText = computed(() => {
    const value = this.triggerElement();
    return typeof value === 'string' ? value : '';
  });

  /** 图标类名，`warning` / `danger` 换成警示图标，颜色由 less 的 `__icon--*` 修饰类提供。 */
  protected readonly iconClasses = computed(() => `t-icon t-popconfirm__icon--${this.theme() || 'default'}`);

  protected readonly iconPath = computed(() => (this.theme() === 'default' ? INFO_ICON_PATH : ERROR_ICON_PATH));

  /** 程序化关闭时记录来源，等 `t-popup` 回传 `visibleChange` 时一并抛出（`t-popup` 只回传布尔值）。 */
  private pendingTrigger: PopconfirmTriggerSource = 'document';

  private pendingEvent: MouseEvent | undefined;

  constructor() {
    effect(() => {
      const visible = this.visible();
      if (visible === undefined) return;
      untracked(() => this.innerVisible.set(visible));
    });

    // 首次渲染后再展开，确保 t-popup 的弹层模板已经就绪。
    afterNextRender(() => {
      if (this.defaultVisible() && this.visible() === undefined) {
        this.innerVisible.set(true);
      }
    });
  }

  /** 展开确认框。 */
  show(): void {
    this.innerVisible.set(true);
  }

  /** 收起确认框。 */
  hide(): void {
    this.innerVisible.set(false);
  }

  protected handleConfirm(event: MouseEvent): void {
    this.confirm.emit({ e: event });
    this.closeBy('confirm', event);
  }

  protected handleCancel(event: MouseEvent): void {
    this.cancel.emit({ e: event });
    this.closeBy('cancel', event);
  }

  /** `t-popup` 只回传布尔值，来源由 `pendingTrigger` 补上；受控时只通知，不自己关。 */
  protected handlePopupVisibleChange(visible: boolean): void {
    if (this.visible() === visible) return;

    const trigger: PopconfirmTriggerSource = visible ? 'trigger-element-click' : this.pendingTrigger;
    const e = this.pendingEvent;
    this.pendingTrigger = 'document';
    this.pendingEvent = undefined;

    if (this.visible() === undefined) {
      this.innerVisible.set(visible);
    }
    this.visibleChange.emit({ visible, trigger, e });
  }

  /**
   * 上游 `setInnerVisible(false, context)`：受控时（`visible` 有值）只抛事件由使用方关，
   * 非受控时改内部状态，让 `t-popup` 关闭并把 `visibleChange` 带回来。
   */
  private closeBy(trigger: PopconfirmTriggerSource, event: MouseEvent): void {
    if (this.visible() !== undefined) {
      this.visibleChange.emit({ visible: false, trigger, e: event });
      return;
    }
    this.pendingTrigger = trigger;
    this.pendingEvent = event;
    this.innerVisible.set(false);
  }

  private resolveButtonProps(base: PopconfirmButtonProps, value: PopconfirmButton): PopconfirmButtonProps {
    if (typeof value === 'string') {
      return value ? { ...base, content: value } : base;
    }
    if (value && typeof value === 'object' && !isTemplate(value)) {
      return { ...base, ...value };
    }
    return base;
  }

  private templateOfButton(
    value: PopconfirmButton,
    props: PopconfirmButtonProps,
  ): TemplateRef<unknown> | null {
    if (isTemplate(value)) return value;
    return isTemplate(props.content) ? props.content : null;
  }

  private textOfButton(props: PopconfirmButtonProps, fallback: string): string {
    const content = props.content;
    return typeof content === 'string' && content ? content : fallback;
  }
}
