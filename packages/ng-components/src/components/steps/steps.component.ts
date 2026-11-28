import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  Renderer2,
  ViewEncapsulation,
  booleanAttribute,
  afterNextRender,
  computed,
  contentChildren,
  effect,
  forwardRef,
  inject,
  input,
  output,
  untracked,
  viewChildren,
} from '@angular/core';
import {
  T_STEPS,
  TStepItem,
  type StepContent,
  type StepHost,
  type StepStatus,
  type StepTheme,
  type StepValue,
} from './step-item.component';
import { createControllableState } from '../../_utils/controllable-state';

export const STEP_SEQUENCES = ['positive', 'reverse'] as const;
export type StepSequence = (typeof STEP_SEQUENCES)[number];

/** 完整步骤切换通知；currentChange 继续只输出值供双向绑定使用。 */
export interface StepsChangeEvent {
  current: StepValue;
  previous: StepValue | undefined;
  e?: MouseEvent | KeyboardEvent;
}

/** 步骤条的排列方向。 */
export const STEP_LAYOUTS = ['horizontal', 'vertical'] as const;
export type StepLayout = (typeof STEP_LAYOUTS)[number];

/** 步骤条连接线的样式。 */
export const STEP_SEPARATORS = ['line', 'dashed', 'arrow'] as const;
export type StepSeparator = (typeof STEP_SEPARATORS)[number];

/** `options` 里一项的数据形状，对应上游 `TdStepItemProps`。 */
export interface StepOption {
  /** 步骤描述，等价于子项的 `content`。 */
  content?: StepContent;
  /** 默认插槽内容，`content` 未设置时使用。 */
  default?: StepContent;
  /** 附加内容。 */
  extra?: StepContent;
  /** 自定义图标。 */
  icon?: boolean | StepContent;
  /** 步骤状态。 */
  status?: StepStatus;
  /** 步骤标题。 */
  title?: StepContent;
  /** 步骤的取值。 */
  value?: StepValue;
}

/**
 * 步骤条。
 *
 * 宿主元素就是 `.t-steps`（`display: flex`），子项 `t-step-item` 直接投影进来参与布局，
 * 因此不需要 ng-template 重排（`vendor/tdesign-common/style/web/components/steps/_index.less`）。
 *
 * 上游按渲染下标算序号与状态，投影子项拿不到这些渲染参数，所以由这个父容器算出后通过
 * `setState()` 推给子项（照 `radio-group` 的 `setGroupState` 写法）。只读与生效主题通过
 * DI 令牌 `T_STEPS` 下发，对应上游的 `stepsState`。
 *
 * 逆序移动原宿主，保留组件实例，并使 vendor 的 :last-child 连接线规则匹配真实顺序。
 */
@Component({
  selector: 't-steps',
  standalone: true,
  imports: [TStepItem],
  template: `
    @if (!normalizedOptions().length) { <ng-content /> }
    @for (option of normalizedOptions(); track option.value ?? option) {
      <t-step-item
        [content]="option.content ?? option.default"
        [extra]="option.extra"
        [icon]="option.icon"
        [status]="option.status ?? 'default'"
        [title]="option.title"
        [value]="option.value"
      />
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'classes()',
    'role': 'list',
  },
  providers: [
    {
      provide: T_STEPS,
      useExisting: forwardRef(() => TSteps),
    },
  ],
})
export class TSteps implements StepHost {
  /** 当前步骤，可双向绑定；取值为子项的 `value`，没设置 `value` 时用下标。 @zh 当前步骤 @en current */
  readonly current = input<StepValue | undefined>(undefined);

  /** 当前步骤的初始值，非受控用法；之后点击会覆盖它。 @zh 默认当前步骤 @en default current */
  readonly defaultCurrent = input<StepValue | undefined>(undefined);

  /** 排列方向。 @zh 排列方向 @en layout @defaultValue horizontal @values horizontal,vertical */
  readonly layout = input<StepLayout>('horizontal');

  /** 数据驱动的步骤项，与投影子项二选一。 @zh 选项列表 @en options */
  readonly options = input<StepOption[] | undefined>(undefined);

  /** 是否只读，只读时步骤不可点击。 @zh 是否只读 @en readonly @defaultValue false */
  readonly readonly = input(false, { transform: booleanAttribute });

  /** 连接线样式。 @zh 连接线样式 @en separator @defaultValue line @values line,dashed,arrow */
  readonly separator = input<StepSeparator>('line');

  /** @zh 步骤显示顺序，逆序不改变取值和步骤序号 @en Visual sequence, reversing preserves step values and numbers @defaultValue positive @values positive,reverse */
  readonly sequence = input<StepSequence>('positive');

  /** 步骤条主题，任一项自定义图标时强制为 `default`。 @zh 主题 @en theme @defaultValue default @values default,dot */
  readonly theme = input<StepTheme>('default');

  /** 当前步骤变化时触发。 @zh 步骤变化 @en current change */
  readonly currentChange = output<StepValue>();

  /** @zh 步骤变化，包含前值和触发事件 @en Step change with previous value and triggering event */
  readonly change = output<StepsChangeEvent>();

  /** `options` 渲染的子项。 */
  private readonly optionItems = viewChildren(TStepItem);

  /** 投影进来的子项。 */
  private readonly slotItems = contentChildren(TStepItem);

  /** 受控值优先，默认值仅初始化一次。 */
  private readonly state = createControllableState(this.current, () => this.defaultCurrent());
  protected readonly activeCurrent = this.state.current;
  private readonly element = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);
  private readonly injector = inject(Injector);

  /** 原流程顺序；非空 options 优先，显示顺序单独计算。 */
  private readonly items = computed(() => this.normalizedOptions().length ? this.optionItems() : this.slotItems());
  private readonly displayItems = computed(() => this.sequence() === 'reverse' ? [...this.items()].reverse() : [...this.items()]);

  /** 宿主类名，与上游 baseClass 一致。 */
  protected readonly classes = computed(() => {
    const theme = this.effectiveTheme();
    return [
      't-steps',
      `t-steps--${this.layout()}`,
      `t-steps--${theme}-anchor`,
      `t-steps--${this.sequence()}`,
      `t-steps--${this.separator()}-separator`,
    ].join(' ');
  });

  /** 实际生效的主题：任一项设置了 `icon` 就回到 `default`，与上游 `handleTheme` 一致。 */
  readonly effectiveTheme = computed<StepTheme>(() =>
    this.items().some((item) => item.icon() !== undefined) ? 'default' : this.theme(),
  );

  /** `@for` 需要一个稳定的可迭代对象，避免每次变更检测都新建数组。 */
  protected readonly normalizedOptions = computed<StepOption[]>(() => this.options() ?? []);

  constructor() {
    // 按下标算好序号与状态推给每个子项，对应上游 renderContent 里的 handleStatus。
    effect(() => {
      const items = this.items();
      const current = this.activeCurrent();
      const displayItems = this.displayItems();
      const positions = new Map<StepValue, number>();
      items.forEach((item, index) => {
        const value = item.value();
        if (value !== undefined) positions.set(value, index);
      });
      const matchIndex = current === undefined ? undefined : positions.get(current);
      items.forEach((item, index) => {
        item.setState({ index, position: displayItems.indexOf(item) + 1, count: items.length, status: this.computeStatus(item, index, current, matchIndex) });
      });
    });
    effect(() => {
      this.displayItems();
      afterNextRender(() => untracked(() => {
        // 原生宿主的重排不改变 Angular 逻辑查询、投影和组件生命周期。
        const host = this.element.nativeElement;
        const ordered = this.displayItems();
        const focused = host.ownerDocument.activeElement as HTMLElement | null;
        const restoreFocus = focused !== null && ordered.some((item) => item.containsElement(focused));
        for (const item of ordered) this.renderer.appendChild(host, item.hostElement);
        if (restoreFocus && focused?.isConnected && focused !== host.ownerDocument.activeElement) focused.focus({ preventScroll: true });
      }), { injector: this.injector });
    });
  }

  /** 子项点击时更新当前步骤并抛事件，取值优先用子项的 `value`，没有时用下标。 */
  select(value: StepValue | undefined, index: number, e?: MouseEvent | KeyboardEvent): void {
    if (this.readonly() || !this.items()[index]?.canSelect()) return;
    const next = value === undefined ? index : value;
    const previous = this.activeCurrent();
    if (next === previous) return;
    this.state.set(next);
    this.currentChange.emit(next);
    this.change.emit({ current: next, previous, e });
  }

  focusStep(index: number, key: string): boolean {
    if (this.readonly()) return false;
    const previous = this.layout() === 'horizontal' ? 'ArrowLeft' : 'ArrowUp';
    const next = this.layout() === 'horizontal' ? 'ArrowRight' : 'ArrowDown';
    if (![previous, next, 'Home', 'End'].includes(key)) return false;
    const available = this.displayItems().filter((item) => item.canSelect());
    const current = available.indexOf(this.items()[index]);
    const target = key === 'Home' ? available[0] : key === 'End' ? available[available.length - 1]
      : available[(current + (key === next ? 1 : -1) + available.length) % available.length];
    target?.focus();
    return true;
  }

  /** 按原流程计算状态：显式 status > FINISH > 下标比较 > 取值比较；逆序仅改变显示。 */
  private computeStatus(
    item: TStepItem,
    index: number,
    current: StepValue | undefined,
    matchIndex: number | undefined,
  ): StepStatus {
    const status = item.status();
    if (status !== 'default') return status;
    if (current === 'FINISH') return 'finish';
    const value = item.value();
    if (value === undefined && index < Number(current)) return 'finish';
    if (value !== undefined) {
      // 设置了取值的项按当前项的位置算：当前项之前的都是已完成，取值对不上时退回 default。
      if (matchIndex === undefined) return 'default';
      if (index < matchIndex) return 'finish';
    }
    const key = value === undefined ? index : value;
    return key === current ? 'process' : 'default';
  }
}
