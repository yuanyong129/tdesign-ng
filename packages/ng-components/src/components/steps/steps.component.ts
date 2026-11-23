import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  contentChildren,
  effect,
  forwardRef,
  input,
  output,
  signal,
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
 * `sequence` 反转顺序没实现：上游靠反转数组重排 DOM，Angular 的投影子项无法重排，
 * 用 `[style.order]` 又会让 `:last-child` 的连接线与 `flex: none` 落到错误的元素上。
 */
@Component({
  selector: 't-steps',
  standalone: true,
  imports: [TStepItem],
  template: `
    <ng-content />
    @for (option of normalizedOptions(); track $index) {
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

  /** 步骤条主题，任一项自定义图标时强制为 `default`。 @zh 主题 @en theme @defaultValue default @values default,dot */
  readonly theme = input<StepTheme>('default');

  /** 当前步骤变化时触发。 @zh 步骤变化 @en current change */
  readonly currentChange = output<StepValue>();

  /** `options` 渲染的子项。 */
  private readonly optionItems = viewChildren(TStepItem);

  /** 投影进来的子项。 */
  private readonly slotItems = contentChildren(TStepItem, { descendants: true });

  /** 内部当前步骤，受控时由 `current` 覆盖。 */
  private readonly innerCurrent = signal<StepValue | undefined>(undefined);

  /** 全部子项，顺序与 DOM 一致：模板里投影在前、`options` 渲染在后。 */
  private readonly items = computed(() => [...this.slotItems(), ...this.optionItems()]);

  /** 宿主类名，与上游 `baseClass` 一致（`sequence` 本期固定为默认值 `positive`）。 */
  protected readonly classes = computed(() => {
    const theme = this.effectiveTheme();
    return [
      't-steps',
      `t-steps--${this.layout()}`,
      `t-steps--${theme}-anchor`,
      't-steps--positive',
      `t-steps--${this.separator()}-separator`,
    ].join(' ');
  });

  /** 实际生效的主题：任一项设置了 `icon` 就回到 `default`，与上游 `handleTheme` 一致。 */
  private readonly effectiveTheme = computed<StepTheme>(() =>
    this.items().some((item) => item.icon() !== undefined) ? 'default' : this.theme(),
  );

  /** `@for` 需要一个稳定的可迭代对象，避免每次变更检测都新建数组。 */
  protected readonly normalizedOptions = computed<StepOption[]>(() => this.options() ?? []);

  constructor() {
    // 受控用法：外部 current 变化时同步进来（对应上游 useVModel 的受控分支）。
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

    // 按下标算好序号与状态推给每个子项，对应上游 renderContent 里的 handleStatus。
    effect(() => {
      const items = this.items();
      const current = this.innerCurrent();
      const positions = new Map<StepValue, number>();
      items.forEach((item, index) => {
        const value = item.value();
        if (value !== undefined) positions.set(value, index);
      });
      const matchIndex = current === undefined ? undefined : positions.get(current);
      items.forEach((item, index) => {
        item.setState({ index, status: this.computeStatus(item, index, current, matchIndex) });
      });
    });
  }

  /** 子项点击时更新当前步骤并抛事件，取值优先用子项的 `value`，没有时用下标。 */
  select(value: StepValue | undefined, index: number): void {
    const next = value === undefined ? index : value;
    if (next === this.innerCurrent()) return;
    this.innerCurrent.set(next);
    this.currentChange.emit(next);
  }

  /** 逐字复刻上游 `handleStatus`：显式 status > `FINISH` 魔法值 > 下标比较 > 取值比较。 */
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
