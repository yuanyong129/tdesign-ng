import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  TemplateRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  numberAttribute,
  output,
  signal,
  untracked,
  viewChild,
} from '@angular/core';
import { TButton } from '../button/button.component';
import type { ButtonSize, ButtonTheme, ButtonVariant } from '../button/button.types';
import type {
  GuideAttachNode,
  GuideButtonProps,
  GuideChangeContext,
  GuideContent,
  GuideFinishContext,
  GuideMode,
  GuideNextContext,
  GuidePopupPlacement,
  GuidePrevContext,
  GuideSkipContext,
  GuideStep,
  GuideStepContentContext,
} from './guide.types';

/** 组件的默认层级，与上游 `zIndex` 默认值一致。 */
const DEFAULT_Z_INDEX = 999999;

/** 高亮层默认外扩距离，与上游 `highlightPadding` 默认值一致。 */
const DEFAULT_HIGHLIGHT_PADDING = 8;

/** 气泡与视口边缘保留的最小间距，用于翻转与边界收敛。 */
const VIEWPORT_GAP = 8;

/** 引导激活时加在 `document.body` 上的类名，vendor less 用 `overflow: hidden` 锁滚动。 */
const BODY_LOCK_CLASS = 't-guide--lock';

/** 内置按钮文案，与上游默认 `locale` 对齐（本仓库没有 ConfigProvider，固定中文）。 */
const DEFAULT_BUTTON_TEXT: Record<'skip' | 'prev' | 'next' | 'finish', string> = {
  skip: '跳过',
  prev: '上一步',
  next: '下一步',
  finish: '完成',
};

type PopupSide = 'top' | 'bottom' | 'left' | 'right';
type PopupAlign = 'left' | 'right' | 'top' | 'bottom';
type GuideAction = 'skip' | 'prev' | 'next' | 'finish';

/** 视口坐标系下的矩形。 */
interface GuideRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

/** 宽高。 */
interface GuideSize {
  width: number;
  height: number;
}

/** 归一化后的按钮配置，模板直接绑定。 */
interface ResolvedGuideButton {
  theme: ButtonTheme;
  variant: ButtonVariant;
  size: ButtonSize;
  disabled: boolean;
  loading: boolean;
  content: string;
  className: string;
}

const OPPOSITE_SIDES: Record<PopupSide, PopupSide> = {
  top: 'bottom',
  bottom: 'top',
  left: 'right',
  right: 'left',
};

/** 判断内容是否需要渲染：空字符串与 `null` 都视为未提供。 */
function isRenderableContent(value: GuideContent): boolean {
  return value !== undefined && value !== null && value !== '';
}

/** 数字输入的安全转换：空值或非法值回退到默认值，避免 `numberAttribute` 产生 `NaN`。 */
function numberOr(value: unknown, fallback: number): number {
  const parsed = numberAttribute(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

/** 把 12 个方向拆成主轴与对齐方向，例如 `top-left` → `{ side: 'top', align: 'left' }`。 */
function splitPlacement(placement: GuidePopupPlacement): { side: PopupSide; align?: PopupAlign } {
  const [side, align] = placement.split('-') as [PopupSide, PopupAlign?];
  return align ? { side, align } : { side };
}

/**
 * 分步引导。
 *
 * 每一步通过 `element` 定位目标元素（CSS 选择器、DOM 元素或返回它们的函数），
 * 高亮该元素并在旁边显示说明卡，支持上一步、下一步、跳过与完成。
 * 结构与类名全部来自 `vendor/tdesign-common/style/web/components/guide/_index.less`：
 * `.t-guide__overlay`、`.t-guide__highlight`、`.t-guide__reference`、`.t-guide__popup`、
 * `.t-guide__wrapper`、`.t-guide__dialog`、`.t-guide__tooltip`、`.t-guide__title`、
 * `.t-guide__desc`、`.t-guide__footer`、`.t-guide__counter`、`.t-guide__action`。
 *
 * 与上游一致，激活期间给 `document.body` 加 `t-guide--lock` 锁滚动，
 * 所有视觉层都相对视口定位，位置通过内联 `top/left/width/height/transform` 表达。
 * 气泡模式不使用 CDK Overlay：Overlay 容器的 `z-index` 低于引导的 `zIndex`，
 * 手写 fixed 定位才能让气泡稳定处于高亮与遮罩之上。
 *
 * 不支持 Esc 关闭与焦点陷阱：上游同样没有这些行为，关闭只能通过跳过、完成或外部改 `current`。
 */
@Component({
  selector: 't-guide',
  standalone: true,
  imports: [NgTemplateOutlet, TButton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './guide.component.html',
  host: { '[class]': 'classes()' },
})
export class TGuide {
  private readonly document = inject(DOCUMENT);
  private readonly destroyRef = inject(DestroyRef);

  /** 自定义计数器，字符串按文本渲染，模板可拿到 `{ current, total }`。 @zh 计数器 @en counter @defaultValue undefined */
  readonly counter = input<GuideContent>(undefined);

  /** 当前步骤下标，从 0 开始；`-1` 表示不展示引导。传入后为受控用法。 @zh 当前步骤 @en current @defaultValue undefined */
  readonly current = input<number | undefined>(undefined);

  /** 默认步骤下标，只在没有传 `current` 时生效。 @zh 默认步骤 @en defaultCurrent @defaultValue undefined */
  readonly defaultCurrent = input<number | undefined>(undefined);

  /** “完成”按钮配置。 @zh 完成按钮 @en finishButtonProps @defaultValue undefined */
  readonly finishButtonProps = input<GuideButtonProps | undefined>(undefined);

  /** 是否隐藏计数器。 @zh 隐藏计数器 @en hideCounter @defaultValue false */
  readonly hideCounter = input(false, { transform: booleanAttribute });

  /** 是否隐藏“上一步”按钮。 @zh 隐藏上一步 @en hidePrev @defaultValue false */
  readonly hidePrev = input(false, { transform: booleanAttribute });

  /** 是否隐藏“跳过”按钮。 @zh 隐藏跳过 @en hideSkip @defaultValue false */
  readonly hideSkip = input(false, { transform: booleanAttribute });

  /** 高亮层相对目标元素的外扩距离（px）。 @zh 高亮内边距 @en highlightPadding @defaultValue 8 */
  readonly highlightPadding = input(8, {
    transform: (value: unknown) => numberOr(value, DEFAULT_HIGHLIGHT_PADDING),
  });

  /** 展示模式：气泡或对话框。 @zh 展示模式 @en mode @defaultValue popup @values popup,dialog */
  readonly mode = input<GuideMode>('popup');

  /** “下一步”按钮配置。 @zh 下一步按钮 @en nextButtonProps @defaultValue undefined */
  readonly nextButtonProps = input<GuideButtonProps | undefined>(undefined);

  /** “上一步”按钮配置。 @zh 上一步按钮 @en prevButtonProps @defaultValue undefined */
  readonly prevButtonProps = input<GuideButtonProps | undefined>(undefined);

  /** 是否展示遮罩。 @zh 展示遮罩 @en showOverlay @defaultValue true */
  readonly showOverlay = input(true, { transform: booleanAttribute });

  /** “跳过”按钮配置。 @zh 跳过按钮 @en skipButtonProps @defaultValue undefined */
  readonly skipButtonProps = input<GuideButtonProps | undefined>(undefined);

  /** 引导步骤列表。 @zh 步骤列表 @en steps @defaultValue undefined */
  readonly steps = input<GuideStep[] | undefined>(undefined);

  /** 引导层级。 @zh 层级 @en zIndex @defaultValue 999999 */
  readonly zIndex = input(999999, {
    transform: (value: unknown) => numberOr(value, DEFAULT_Z_INDEX),
  });

  /** 当前步骤变化时触发，内部翻页与关闭都会抛出。 @zh 步骤变化 @en change */
  readonly change = output<GuideChangeContext>();

  /** 当前步骤下标变化时触发，用于 `[current]` / `(currentChange)` 双向绑定。 @zh 当前步骤变化 @en currentChange */
  readonly currentChange = output<number>();

  /** 点击“完成”时触发。 @zh 完成 @en finish */
  readonly finish = output<GuideFinishContext>();

  /** 点击“下一步”时触发。 @zh 下一步 @en next */
  readonly next = output<GuideNextContext>();

  /** 点击“上一步”时触发。 @zh 上一步 @en prev */
  readonly prev = output<GuidePrevContext>();

  /** 点击“跳过”时触发。 @zh 跳过 @en skip */
  readonly skip = output<GuideSkipContext>();

  /** 内部当前步骤，受控时由 `current` 覆盖。 */
  private readonly innerCurrent = signal(-1);

  /** 目标元素（含高亮内边距）的视口矩形。 */
  private readonly anchorRect = signal<GuideRect | null>(null);

  /** 自定义高亮内容的实测尺寸，位置沿用 `anchorRect` 的左上角。 */
  private readonly customHighlightSize = signal<GuideSize | null>(null);

  /** 对话框自身的视口矩形，对话框模式用它当高亮对象。 */
  private readonly dialogRect = signal<GuideRect | null>(null);

  /** 气泡实测尺寸，用于翻转与边界收敛。 */
  private readonly popupSize = signal<GuideSize>({ width: 0, height: 0 });

  private readonly highlightRef = viewChild<ElementRef<HTMLElement>>('highlightEl');
  private readonly popupRef = viewChild<ElementRef<HTMLElement>>('popupEl');
  private readonly dialogRef = viewChild<ElementRef<HTMLElement>>('dialogEl');

  private readonly observed = new Set<Element>();
  private resizeObserver: ResizeObserver | null = null;
  private measureFrame = 0;
  private listenersBound = false;
  private pendingScroll = false;
  private lastMode: GuideMode | null = null;
  private lastIndex = -1;

  /** 宿主类名：所有视觉层都是内部节点，宿主本身只承担组件边界。 */
  protected readonly classes = computed(() => 't-guide');

  /** 步骤总数。 */
  protected readonly total = computed(() => this.steps()?.length ?? 0);

  /** 当前步骤配置，下标越界时为 `undefined`，也是“是否激活”的唯一依据。 */
  protected readonly activeStep = computed<GuideStep | undefined>(() => {
    const steps = this.steps();
    const index = this.innerCurrent();
    if (!steps || index < 0 || index >= steps.length) return undefined;
    return steps[index];
  });

  /** 是否处于引导中。 */
  protected readonly actived = computed(() => this.activeStep() !== undefined);

  /** 实际展示模式，步骤级 `mode` 优先。 */
  protected readonly effectiveMode = computed<GuideMode>(() => this.activeStep()?.mode ?? this.mode());

  /** 是否气泡模式。 */
  protected readonly isPopup = computed(() => this.effectiveMode() === 'popup');

  /** 实际高亮内边距，步骤级配置优先。 */
  protected readonly effectivePadding = computed(
    () => this.activeStep()?.highlightPadding ?? this.highlightPadding(),
  );

  /** 是否展示遮罩，步骤级配置优先。 */
  protected readonly hasOverlay = computed(
    () => this.activeStep()?.showOverlay ?? this.showOverlay(),
  );

  /** 是否第一步。 */
  protected readonly isFirst = computed(() => this.innerCurrent() <= 0);

  /** 是否最后一步。 */
  protected readonly isLast = computed(() => {
    const total = this.total();
    return total > 0 && this.innerCurrent() === total - 1;
  });

  /** 是否展示“跳过”按钮。 */
  protected readonly showSkip = computed(() => !this.hideSkip() && !this.isLast());

  /** 是否展示“上一步”按钮。 */
  protected readonly showPrev = computed(() => !this.hidePrev() && !this.isFirst());

  /** 是否使用自定义气泡内容。 */
  protected readonly hasCustomContent = computed(() =>
    isRenderableContent(this.activeStep()?.content),
  );

  /** 是否展示气泡箭头：自定义内容时隐藏，与上游 `show-arrow: !content` 一致。 */
  protected readonly showArrow = computed(() => !this.hasCustomContent());

  /** 是否展示自定义高亮内容，仅气泡模式生效。 */
  protected readonly hasCustomHighlight = computed(
    () => this.isPopup() && isRenderableContent(this.activeStep()?.highlightContent),
  );

  /** 步骤标题。 */
  protected readonly title = computed(() => this.activeStep()?.title ?? '');

  /** 步骤说明的模板形态。 */
  protected readonly bodyTemplate = computed(() => this.asTemplate(this.activeStep()?.body));

  /** 步骤说明的文本形态。 */
  protected readonly bodyText = computed(() => this.asText(this.activeStep()?.body));

  /** 自定义气泡内容的模板形态。 */
  protected readonly contentTemplate = computed(() => this.asTemplate(this.activeStep()?.content));

  /** 自定义气泡内容的文本形态。 */
  protected readonly contentText = computed(() => this.asText(this.activeStep()?.content));

  /** 自定义高亮内容的模板形态。 */
  protected readonly highlightTemplate = computed(() =>
    this.asTemplate(this.activeStep()?.highlightContent),
  );

  /** 自定义高亮内容的文本形态。 */
  protected readonly highlightText = computed(() => this.asText(this.activeStep()?.highlightContent));

  /** 自定义计数器模板。 */
  protected readonly counterTemplate = computed(() => this.asTemplate(this.counter()));

  /** 计数器文案：字符串自定义优先，否则用 `当前/总数`。 */
  protected readonly counterText = computed(() => {
    const counter = this.counter();
    if (typeof counter === 'string' && counter !== '') return counter;
    return `${this.innerCurrent() + 1}/${this.total()}`;
  });

  /** 气泡根类名。 */
  protected readonly popupClasses = computed(() => {
    const stepClass = this.activeStep()?.stepOverlayClass ?? '';
    return ['t-popup', 't-guide__popup', stepClass].filter(Boolean).join(' ');
  });

  /** 气泡内容类名：自定义内容时追加 `t-guide__popup--content` 去掉内边距与阴影。 */
  protected readonly popupContentClasses = computed(() =>
    ['t-popup__content', this.hasCustomContent() ? 't-guide__popup--content' : '']
      .filter(Boolean)
      .join(' '),
  );

  /** 高亮层类名。 */
  protected readonly highlightClasses = computed(() =>
    [
      't-guide__highlight',
      `t-guide__highlight--${this.isPopup() ? 'popup' : 'dialog'}`,
      't-guide--fixed',
      this.hasOverlay() ? 't-guide__highlight--mask' : 't-guide__highlight--nomask',
    ].join(' '),
  );

  /** 定位锚点层类名，气泡模式下与高亮层同几何。 */
  protected readonly referenceClasses = computed(() => 't-guide__reference t-guide--fixed');

  /** 对话框容器类名。 */
  protected readonly dialogWrapperClasses = computed(() =>
    ['t-guide__wrapper', this.dialogPlacement() === 'center' ? 't-guide__wrapper--center' : '']
      .filter(Boolean)
      .join(' '),
  );

  /** 对话框类名。 */
  protected readonly dialogClasses = computed(() =>
    [
      't-guide__reference',
      't-guide--absolute',
      't-guide__dialog',
      this.hasOverlay() ? '' : 't-guide__dialog--nomask',
      this.activeStep()?.stepOverlayClass ?? '',
    ]
      .filter(Boolean)
      .join(' '),
  );

  /** 对话框位置，步骤级 `placement` 优先，默认贴顶。 */
  private readonly dialogPlacement = computed<'top' | 'center'>(() =>
    this.activeStep()?.placement === 'center' ? 'center' : 'top',
  );

  /** 高亮层内联几何。 */
  protected readonly highlightStyle = computed<Record<string, string>>((): Record<string, string> => {
    const rect = this.isPopup() ? this.anchorRect() : this.dialogRect();
    if (!rect) return { visibility: 'hidden' };
    if (this.hasCustomHighlight()) {
      const size = this.customHighlightSize();
      if (!size) return { visibility: 'hidden' };
      return {
        top: `${rect.top}px`,
        left: `${rect.left}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
      };
    }
    return {
      top: `${rect.top}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
      height: `${rect.height}px`,
    };
  });

  /** 定位锚点层内联几何，与高亮层保持一致。 */
  protected readonly referenceStyle = computed<Record<string, string>>(() => this.highlightStyle());

  /** 气泡内联定位：视口坐标 + fixed + transform 贴边。 */
  protected readonly popupStyle = computed<Record<string, string>>(() => {
    const rect = this.anchorRect();
    const base: Record<string, string> = {
      position: 'fixed',
      'z-index': `${this.zIndex()}`,
    };
    if (!rect) return { ...base, visibility: 'hidden' };
    return this.buildPopupStyle(this.resolvedPlacement(), rect);
  });

  /** 实际气泡方向：空间不足时按主轴翻转，保留对齐后缀。 */
  private readonly resolvedPlacement = computed<GuidePopupPlacement>(() => {
    const raw = this.activeStep()?.placement;
    const preferred: GuidePopupPlacement = raw === undefined || raw === 'center' ? 'top' : raw;
    const rect = this.anchorRect();
    const size = this.popupSize();
    const win = this.window();
    if (!rect || !win || size.width === 0 || size.height === 0) return preferred;

    const { side, align } = splitPlacement(preferred);
    const opposite = OPPOSITE_SIDES[side];
    const space = this.sideSpace(side, rect, win);
    const oppositeSpace = this.sideSpace(opposite, rect, win);
    const need = side === 'top' || side === 'bottom' ? size.height : size.width;
    const nextSide = space < need + VIEWPORT_GAP && oppositeSpace > space ? opposite : side;
    return (align ? `${nextSide}-${align}` : nextSide) as GuidePopupPlacement;
  });

  /** 映射成 popup less 认识的 `data-popper-placement` 值（`-start` / `-end`）。 */
  protected readonly popperPlacement = computed(() => {
    const placement = this.resolvedPlacement();
    const { side, align } = splitPlacement(placement);
    if (!align) return side;
    return `${side}-${align === 'left' || align === 'top' ? 'start' : 'end'}`;
  });

  /** 自定义内容的渲染上下文。 */
  protected readonly contentContext = computed(() => {
    const step = this.activeStep();
    const context: GuideStepContentContext = {
      current: this.innerCurrent(),
      total: this.total(),
      currentStepInfo: step,
      isFirst: this.isFirst(),
      isLast: this.isLast(),
      prev: (e?: MouseEvent) => this.handlePrev(e),
      next: (e?: MouseEvent) => this.handleNext(e),
      skip: (e?: MouseEvent) => this.handleSkip(e),
      finish: (e?: MouseEvent) => this.handleFinish(e),
    };
    return { $implicit: context, ...context };
  });

  /** 步骤模板的渲染上下文，`$implicit` 是当前步骤配置。 */
  protected readonly stepContext = computed(() => {
    const step = this.activeStep();
    return {
      $implicit: step,
      currentStepInfo: step,
      current: this.innerCurrent(),
      total: this.total(),
    };
  });

  /** 计数器模板的渲染上下文。 */
  protected readonly counterContext = computed(() => {
    const context = { current: this.innerCurrent() + 1, total: this.total() };
    return { $implicit: context, ...context };
  });

  /** 归一化后的“跳过”按钮。 */
  protected readonly skipButton = computed(() => this.resolveButton('skip'));

  /** 归一化后的“上一步”按钮。 */
  protected readonly prevButton = computed(() => this.resolveButton('prev'));

  /** 归一化后的“下一步”按钮。 */
  protected readonly nextButton = computed(() => this.resolveButton('next'));

  /** 归一化后的“完成”按钮。 */
  protected readonly finishButton = computed(() => this.resolveButton('finish'));

  constructor() {
    this.createResizeObserver();

    // 受控用法：外部 current 变化时同步进来。
    effect(() => {
      const current = this.current();
      if (current !== undefined) {
        untracked(() => this.innerCurrent.set(current));
      }
    });

    // 非受控用法：defaultCurrent 作为初始值，只在没传 current 时生效。
    effect(() => {
      const defaultCurrent = this.defaultCurrent();
      if (defaultCurrent !== undefined && this.current() === undefined) {
        untracked(() => this.innerCurrent.set(defaultCurrent));
      }
    });

    // 激活状态、模式与步骤变化时重新测量；失活时清掉几何与监听。
    effect(() => {
      const active = this.actived();
      const mode = this.effectiveMode();
      const index = this.innerCurrent();
      this.activeStep();
      untracked(() => {
        this.syncBodyLock(active);
        if (!active) {
          this.resetGeometry();
          this.unbindViewportListeners();
          this.pendingScroll = false;
          this.lastMode = null;
          this.lastIndex = -1;
          return;
        }
        this.bindViewportListeners();
        // 步骤或模式切换时先藏起旧几何，避免新内容在旧位置闪一帧。
        if (mode !== this.lastMode || index !== this.lastIndex) {
          this.resetGeometry();
          this.lastMode = mode;
          this.lastIndex = index;
        }
        this.pendingScroll = true;
        this.scheduleMeasure();
      });
    });

    this.destroyRef.onDestroy(() => this.teardown());
  }

  /** 点击“跳过”。 */
  protected handleSkip(event?: MouseEvent): void {
    const current = this.innerCurrent();
    if (current < 0) return;
    const total = this.total();
    this.commit(-1, event);
    this.skip.emit({ e: event, current, total });
  }

  /** 点击“完成”。 */
  protected handleFinish(event?: MouseEvent): void {
    const current = this.innerCurrent();
    if (current < 0) return;
    const total = this.total();
    this.commit(-1, event);
    this.finish.emit({ e: event, current, total });
  }

  /** 点击“上一步”。 */
  protected handlePrev(event?: MouseEvent): void {
    const current = this.innerCurrent();
    if (current <= 0) return;
    const total = this.total();
    const prev = current - 1;
    this.commit(prev, event);
    this.prev.emit({ e: event, prev, current, total });
  }

  /** 点击“下一步”。 */
  protected handleNext(event?: MouseEvent): void {
    const current = this.innerCurrent();
    const total = this.total();
    if (current < 0 || current >= total - 1) return;
    const next = current + 1;
    this.commit(next, event);
    this.next.emit({ e: event, next, current, total });
  }

  /** 把内容按模板或文本分派，模板用 `instanceof TemplateRef` 判断。 */
  protected asTemplate(value: GuideContent): TemplateRef<unknown> | null {
    return value instanceof TemplateRef ? value : null;
  }

  /** 把内容按模板或文本分派，返回可渲染的字符串。 */
  protected asText(value: GuideContent): string {
    return typeof value === 'string' ? value : '';
  }

  /** 提交新的步骤下标：先更新内部状态，再抛 `currentChange` 与 `change`。 */
  private commit(next: number, event?: MouseEvent): void {
    this.innerCurrent.set(next);
    this.currentChange.emit(next);
    this.change.emit({ e: event, current: next, total: this.total() });
  }

  /** 解析按钮配置：步骤级覆盖组件级，“完成”只认组件级，与上游一致。 */
  private resolveButton(kind: GuideAction): ResolvedGuideButton {
    const step = this.activeStep();
    const componentProps =
      kind === 'skip'
        ? this.skipButtonProps()
        : kind === 'prev'
          ? this.prevButtonProps()
          : kind === 'next'
            ? this.nextButtonProps()
            : this.finishButtonProps();
    const stepProps =
      kind === 'skip'
        ? step?.skipButtonProps
        : kind === 'prev'
          ? step?.prevButtonProps
          : kind === 'next'
            ? step?.nextButtonProps
            : undefined;
    const props = stepProps ?? componentProps;

    return {
      theme: props?.theme ?? (kind === 'skip' || kind === 'prev' ? 'default' : 'primary'),
      variant: props?.variant ?? 'base',
      size: props?.size ?? (this.isPopup() ? 'small' : 'medium'),
      disabled: props?.disabled ?? false,
      loading: props?.loading ?? false,
      content: props?.content ?? DEFAULT_BUTTON_TEXT[kind],
      className: props?.className ?? '',
    };
  }

  /** 目标元素主轴方向上的可用空间。 */
  private sideSpace(side: PopupSide, rect: GuideRect, win: Window): number {
    switch (side) {
      case 'top':
        return rect.top;
      case 'bottom':
        return win.innerHeight - (rect.top + rect.height);
      case 'left':
        return rect.left;
      case 'right':
        return win.innerWidth - (rect.left + rect.width);
    }
  }

  /** 解析步骤的 `offset` 为像素偏移。 */
  private popupOffset(): { x: number; y: number } {
    const offset = this.activeStep()?.offset;
    const parse = (value: string | number | undefined): number => {
      if (typeof value === 'number') return value;
      if (typeof value === 'string') {
        const parsed = Number.parseFloat(value);
        return Number.isFinite(parsed) ? parsed : 0;
      }
      return 0;
    };
    return { x: parse(offset?.[0]), y: parse(offset?.[1]) };
  }

  /** 根据方向与实测尺寸计算气泡的 fixed 定位。 */
  private buildPopupStyle(placement: GuidePopupPlacement, rect: GuideRect): Record<string, string> {
    const offset = this.popupOffset();
    const size = this.popupSize();
    const win = this.window();
    const { side, align } = splitPlacement(placement);
    let left = 0;
    let top = 0;
    let translateX = '0';
    let translateY = '0';

    if (side === 'top' || side === 'bottom') {
      top = side === 'top' ? rect.top : rect.top + rect.height;
      translateY = side === 'top' ? '-100%' : '0';
      if (align === 'left') {
        left = rect.left;
      } else if (align === 'right') {
        left = rect.left + rect.width;
        translateX = '-100%';
      } else {
        left = rect.left + rect.width / 2;
        translateX = '-50%';
      }

      if (win && size.width > 0) {
        if (align === 'left' && left + size.width > win.innerWidth - VIEWPORT_GAP) {
          const flipped = rect.left + rect.width;
          if (flipped - size.width >= VIEWPORT_GAP) {
            left = flipped;
            translateX = '-100%';
          }
        } else if (align === 'right' && left - size.width < VIEWPORT_GAP) {
          const flipped = rect.left;
          if (flipped + size.width <= win.innerWidth - VIEWPORT_GAP) {
            left = flipped;
            translateX = '0';
          }
        } else if (!align) {
          const half = size.width / 2;
          const min = half + VIEWPORT_GAP;
          const max = win.innerWidth - half - VIEWPORT_GAP;
          if (min <= max) left = Math.min(Math.max(left, min), max);
        }
      }
    } else {
      left = side === 'left' ? rect.left : rect.left + rect.width;
      translateX = side === 'left' ? '-100%' : '0';
      if (align === 'top') {
        top = rect.top;
      } else if (align === 'bottom') {
        top = rect.top + rect.height;
        translateY = '-100%';
      } else {
        top = rect.top + rect.height / 2;
        translateY = '-50%';
      }

      if (win && size.height > 0) {
        if (align === 'top' && top + size.height > win.innerHeight - VIEWPORT_GAP) {
          const flipped = rect.top + rect.height;
          if (flipped - size.height >= VIEWPORT_GAP) {
            top = flipped;
            translateY = '-100%';
          }
        } else if (align === 'bottom' && top - size.height < VIEWPORT_GAP) {
          const flipped = rect.top;
          if (flipped + size.height <= win.innerHeight - VIEWPORT_GAP) {
            top = flipped;
            translateY = '0';
          }
        } else if (!align) {
          const half = size.height / 2;
          const min = half + VIEWPORT_GAP;
          const max = win.innerHeight - half - VIEWPORT_GAP;
          if (min <= max) top = Math.min(Math.max(top, min), max);
        }
      }
    }

    // 竖向排列（placement=left/right）时上面的分支只做了纵向翻转，横向仍可能整块跑出视口
    // （目标贴着左边缘、气泡在左侧时就会变成负坐标）。这里统一把 translate 折算成真实盒位置，
    // 再整体收敛进视口内边距，避免气泡被裁掉。横向/纵向分支已经处理过的对齐不再受影响，
    // 因为它只是把最终结果夹到合法范围内。
    if (win && size.width > 0 && size.height > 0) {
      const boxLeft =
        translateX === '-100%' ? left - size.width : translateX === '-50%' ? left - size.width / 2 : left;
      const boxTop =
        translateY === '-100%' ? top - size.height : translateY === '-50%' ? top - size.height / 2 : top;
      const maxLeft = Math.max(VIEWPORT_GAP, win.innerWidth - size.width - VIEWPORT_GAP);
      const maxTop = Math.max(VIEWPORT_GAP, win.innerHeight - size.height - VIEWPORT_GAP);
      return {
        position: 'fixed',
        top: `${Math.min(Math.max(boxTop, VIEWPORT_GAP), maxTop) + offset.y}px`,
        left: `${Math.min(Math.max(boxLeft, VIEWPORT_GAP), maxLeft) + offset.x}px`,
        transform: 'none',
        'z-index': `${this.zIndex()}`,
      };
    }

    return {
      position: 'fixed',
      top: `${top + offset.y}px`,
      left: `${left + offset.x}px`,
      transform: `translate(${translateX}, ${translateY})`,
      'z-index': `${this.zIndex()}`,
    };
  }

  /** 解析目标元素：选择器、DOM 元素、函数，缺省或找不到时退回 `document.body`。 */
  private resolveTarget(element: GuideAttachNode): HTMLElement | null {
    let resolved: string | HTMLElement | null | undefined;
    if (typeof element === 'function') {
      resolved = element();
    } else {
      resolved = element;
    }

    if (typeof resolved === 'string') {
      if (resolved.trim() === '') return this.document.body;
      try {
        const found = this.document.querySelector<HTMLElement>(resolved);
        if (!found) {
          console.warn(`[t-guide] 未找到目标元素：${resolved}`);
          return null;
        }
        return found;
      } catch {
        console.warn(`[t-guide] 目标元素选择器无效：${resolved}`);
        return null;
      }
    }

    if (typeof HTMLElement !== 'undefined' && resolved instanceof HTMLElement) return resolved;
    if (resolved === null || resolved === undefined) return this.document.body;
    return null;
  }

  /** 视口尺寸变化时重测（滚动也重测，锁定滚动后仍然安全）。 */
  private readonly onViewportChange = (): void => {
    this.pendingScroll = false;
    this.scheduleMeasure();
  };

  /** 监听窗口尺寸与滚动。 */
  private bindViewportListeners(): void {
    const win = this.window();
    if (!win || this.listenersBound) return;
    win.addEventListener('resize', this.onViewportChange, { passive: true });
    win.addEventListener('scroll', this.onViewportChange, { passive: true, capture: true });
    this.listenersBound = true;
  }

  /** 移除窗口监听。 */
  private unbindViewportListeners(): void {
    const win = this.window();
    if (!win || !this.listenersBound) return;
    win.removeEventListener('resize', this.onViewportChange);
    win.removeEventListener('scroll', this.onViewportChange, { capture: true });
    this.listenersBound = false;
  }

  /** 创建 ResizeObserver，目标元素、气泡、对话框、高亮层尺寸变化时重测。 */
  private createResizeObserver(): void {
    if (typeof ResizeObserver === 'undefined') return;
    this.resizeObserver = new ResizeObserver(() => this.scheduleMeasure());
  }

  /** 只观察当前存在的元素，避免每帧反复 observe/unobserve 触发死循环。 */
  private syncObservers(elements: Array<Element | null>): void {
    const observer = this.resizeObserver;
    if (!observer) return;
    const next = new Set<Element>();
    for (const element of elements) {
      if (element) next.add(element);
    }
    for (const element of this.observed) {
      if (!next.has(element)) observer.unobserve(element);
    }
    for (const element of next) {
      if (!this.observed.has(element)) observer.observe(element);
    }
    this.observed.clear();
    next.forEach((element) => this.observed.add(element));
  }

  /** 合并同一帧内的多次测量请求。 */
  private scheduleMeasure(): void {
    const win = this.window();
    if (!win) return;
    if (this.measureFrame !== 0) return;
    this.measureFrame = win.requestAnimationFrame(() => {
      this.measureFrame = 0;
      this.measure();
    });
  }

  /** 测量目标元素、气泡、对话框与高亮层，并把结果写入信号。 */
  private measure(): void {
    if (!this.actived()) return;
    const win = this.window();
    if (!win) return;
    const target = this.resolveTarget(this.activeStep()?.element);
    if (!target) {
      this.anchorRect.set(null);
      this.dialogRect.set(null);
      this.customHighlightSize.set(null);
      this.popupSize.set({ width: 0, height: 0 });
      return;
    }

    if (this.pendingScroll) {
      this.pendingScroll = false;
      this.ensureVisible(target);
    }

    const padding = this.effectivePadding();
    const raw = target.getBoundingClientRect();
    this.anchorRect.set({
      top: raw.top - padding,
      left: raw.left - padding,
      width: raw.width + padding * 2,
      height: raw.height + padding * 2,
    });

    if (this.isPopup()) {
      this.dialogRect.set(null);
      const popupElement = this.popupRef()?.nativeElement;
      if (popupElement) {
        const rect = popupElement.getBoundingClientRect();
        this.popupSize.set({ width: rect.width, height: rect.height });
      }
      const highlightElement = this.highlightRef()?.nativeElement;
      if (this.hasCustomHighlight() && highlightElement) {
        const rect = highlightElement.getBoundingClientRect();
        this.customHighlightSize.set(
          rect.width > 0 && rect.height > 0
            ? { width: rect.width, height: rect.height }
            : null,
        );
      } else {
        this.customHighlightSize.set(null);
      }
    } else {
      const dialogElement = this.dialogRef()?.nativeElement;
      if (dialogElement) {
        const rect = dialogElement.getBoundingClientRect();
        this.dialogRect.set({
          top: rect.top,
          left: rect.left,
          width: rect.width,
          height: rect.height,
        });
      }
      this.customHighlightSize.set(null);
    }

    this.syncObservers([
      target,
      this.popupRef()?.nativeElement ?? null,
      this.dialogRef()?.nativeElement ?? null,
      this.highlightRef()?.nativeElement ?? null,
    ]);
  }

  /** 目标不在视口内时滚动到视口中间，先处理可滚动父容器。 */
  private ensureVisible(target: HTMLElement): void {
    const win = this.window();
    if (!win) return;
    this.scrollParentIntoView(target);
    const rect = target.getBoundingClientRect();
    const inViewport =
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= win.innerHeight &&
      rect.right <= win.innerWidth;
    if (inViewport) return;
    // 锁滚动时 `overflow: hidden` 可能让 `scrollTo` 失效，滚动前后临时解锁。
    const body = this.document.body;
    const locked = body?.classList.contains(BODY_LOCK_CLASS) ?? false;
    if (locked) this.syncBodyLock(false);
    win.scrollTo({
      top: win.scrollY + rect.top - (win.innerHeight / 2 - rect.height / 2),
      left: win.scrollX + rect.left - (win.innerWidth / 2 - rect.width / 2),
      behavior: 'auto',
    });
    if (locked) this.syncBodyLock(true);
  }

  /** 最近的纵向可滚动父容器内滚动到可见区域。 */
  private scrollParentIntoView(target: HTMLElement): void {
    let parent = target.parentElement;
    while (parent && parent !== this.document.body && parent !== this.document.documentElement) {
      const style = this.document.defaultView?.getComputedStyle(parent);
      if (style && /(auto|scroll)/.test(style.overflowY)) break;
      parent = parent.parentElement;
    }
    if (!parent || parent === this.document.body || parent === this.document.documentElement) return;
    const parentRect = parent.getBoundingClientRect();
    const rect = target.getBoundingClientRect();
    if (rect.top >= parentRect.top && rect.bottom <= parentRect.bottom) return;
    parent.scrollTop += rect.top - parentRect.top - (parentRect.height - rect.height) / 2;
  }

  /** 清空几何信号，避免模式或步骤切换时闪到旧位置。 */
  private resetGeometry(): void {
    this.anchorRect.set(null);
    this.dialogRect.set(null);
    this.customHighlightSize.set(null);
    this.popupSize.set({ width: 0, height: 0 });
  }

  /** 同步 `document.body` 上的滚动锁。 */
  private syncBodyLock(active: boolean): void {
    const body = this.document.body;
    if (!body) return;
    body.classList.toggle(BODY_LOCK_CLASS, active);
  }

  /** 组件销毁时移除监听、观察器、待执行的帧与滚动锁。 */
  private teardown(): void {
    const win = this.window();
    if (this.measureFrame !== 0 && win) win.cancelAnimationFrame(this.measureFrame);
    this.measureFrame = 0;
    this.unbindViewportListeners();
    this.resizeObserver?.disconnect();
    this.resizeObserver = null;
    this.observed.clear();
    this.document.body?.classList.remove(BODY_LOCK_CLASS);
  }

  /** 当前窗口，SSR 下可能为空。 */
  private window(): Window | null {
    return this.document.defaultView;
  }
}
