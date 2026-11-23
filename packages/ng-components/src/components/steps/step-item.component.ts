import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  InjectionToken,
  TemplateRef,
  ViewEncapsulation,
  computed,
  inject,
  input,
  signal,
  type Signal,
} from '@angular/core';

/** 步骤条节点的状态，与上游 `status` 的可选值一致。 */
export const STEP_STATUSES = ['default', 'process', 'finish', 'error'] as const;
export type StepStatus = (typeof STEP_STATUSES)[number];

/** 步骤条主题：`default` 用圆形序号，`dot` 只画圆点。 */
export const STEP_THEMES = ['default', 'dot'] as const;
export type StepTheme = (typeof STEP_THEMES)[number];

/** 步骤条里的富文本属性：字符串按文本渲染，`TemplateRef` 交给 `*ngTemplateOutlet` 渲染。 */
export type StepContent = string | TemplateRef<unknown> | undefined;

/** 步骤项的取值，可以是字符串或数字；与父容器的 `current` 按全等比较。 */
export type StepValue = string | number;

/** 步骤项图标：布尔值表示用/不用默认图标，也可以传入文本或模板。 */
export type StepIcon = boolean | StepContent;

/** 父容器推给子项的渲染状态，由父容器按下标计算（对应上游的 `index` 与 `status`）。 */
export interface StepItemState {
  /** 正序下标，用于渲染序号与比较 `current`。 */
  index: number;
  /** 计算后的状态。 */
  status: StepStatus;
}

/** 步骤条父容器通过 DI 下发给子项的量，对应上游的 `stepsState`。 */
export interface StepHost {
  /** 是否只读，只读时子项不可点击。 */
  readonly: Signal<boolean>;
  /** 实际生效的主题：任一项自定义图标时被父容器强制成 `default`。 */
  theme: Signal<StepTheme>;
  /** 点击可点击的子项时回传给父容器。 */
  select(value: StepValue | undefined, index: number): void;
}

/** 父容器 `TSteps` 的注入令牌，子项靠它读只读/主题并上报点击。 */
export const T_STEPS = new InjectionToken<StepHost>('TSteps');

/**
 * 步骤项。
 *
 * 宿主元素就是 `.t-steps-item`（`flex: 1`），作为父容器 `.t-steps` 的直接子项参与布局
 * （`vendor/tdesign-common/style/web/components/steps/_mixin.less`），因此父容器不需要
 * ng-template 重排子项。
 *
 * 序号与状态由父容器按下标算出后通过 `setState()` 推进来：上游把 `index` 与 `status`
 * 作为渲染参数传给子项（`step-item.mjs` 的 `props.index` / `props.status`），Angular 的
 * 投影子项拿不到这些渲染参数，只能由父容器下发。
 */
@Component({
  selector: 't-step-item',
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

    <div class="t-steps-item__inner" [class.t-steps-item--clickable]="clickable()" (click)="handleClick()">
      <div [class]="iconClasses()">
        @if (customIcon()) {
          <ng-container *ngTemplateOutlet="renderNode; context: { $implicit: customIcon() }" />
        } @else if (defaultIconVisible()) {
          <span class="t-steps-item__icon--number">
            @switch (state().status) {
              @case ('finish') {
                <svg class="t-icon t-icon-check" viewBox="0 0 24 24" width="1em" height="1em" aria-hidden="true">
                  <path
                    fill="none"
                    stroke="currentColor"
                    stroke-linecap="square"
                    stroke-width="2"
                    d="M19.5708 7.37842L10.3785 16.5708L5.42871 11.6211"
                  />
                </svg>
              }
              @case ('error') {
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
              @default {
                {{ state().index + 1 }}
              }
            }
          </span>
        }
      </div>
      <div class="t-steps-item__content">
        <div class="t-steps-item__title">
          <ng-container *ngTemplateOutlet="renderNode; context: { $implicit: title() }" />
        </div>
        <div class="t-steps-item__description">
          @if (content()) {
            <ng-container *ngTemplateOutlet="renderNode; context: { $implicit: content() }" />
          } @else {
            <ng-content />
          }
        </div>
        <div class="t-steps-item__extra">
          <ng-container *ngTemplateOutlet="renderNode; context: { $implicit: extra() }" />
        </div>
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'classes()',
  },
})
export class TStepItem {
  /** 步骤描述，未设置时使用投影内容。 @zh 步骤描述 @en content */
  readonly content = input<StepContent>(undefined);

  /** 步骤的附加内容，渲染在描述下方。 @zh 附加内容 @en extra */
  readonly extra = input<StepContent>(undefined);

  /** 自定义图标，布尔值表示用/不用默认图标，也可以传入文本或模板。 @zh 图标 @en icon */
  readonly icon = input<StepIcon>(undefined);

  /** 步骤状态，`default` 之外的状态会覆盖父容器算出的结果。 @zh 状态 @en status @defaultValue default @values default,process,finish,error */
  readonly status = input<StepStatus>('default');

  /** 步骤标题。 @zh 标题 @en title */
  readonly title = input<StepContent>(undefined);

  /** 步骤的取值，用于和父容器的 `current` 对应；不设置时用下标。 @zh 唯一标识 @en value */
  readonly value = input<StepValue | undefined>(undefined);

  /** 父容器；独立使用（没有 `t-steps`）时不渲染序号、也不可点击。 */
  private readonly host = inject(T_STEPS, { optional: true });

  /** 由父容器下发的渲染状态；模板里要读它，所以是 protected。 */
  protected readonly state = signal<StepItemState>({ index: 0, status: 'default' });

  /** 宿主类名，状态修饰类与上游 `baseClass` 一致。 */
  protected readonly classes = computed(() => `t-steps-item t-steps-item--${this.state().status}`);

  /** 图标容器的类名：上游 `iconClass` 挂的是同一个 `--status` 修饰类（不是 `__icon--status`）。 */
  protected readonly iconClasses = computed(() => `t-steps-item__icon t-steps-item--${this.state().status}`);

  /** 是否自定义了图标；只有文本或模板算自定义，布尔值表示用/不用默认图标。 */
  protected readonly customIcon = computed<StepContent | null>(() => {
    const icon = this.icon();
    return typeof icon === 'string' || icon instanceof TemplateRef ? icon : null;
  });

  /** 是否渲染默认图标：没有自定义图标、且主题是 `default`（`dot` 主题不画序号）。 */
  protected readonly defaultIconVisible = computed(() => this.icon() === undefined && this.theme() === 'default');

  /** 是否可点击：非 `process` 状态且父容器不是只读。 */
  protected readonly clickable = computed(() => {
    const host = this.host;
    return host !== null && !host.readonly() && this.state().status !== 'process';
  });

  /** 实际生效的主题，由父容器统一下发。 */
  private readonly theme = computed<StepTheme>(() => this.host?.theme() ?? 'default');

  /** 父容器用它把按下标算好的序号与状态推下来。 */
  setState(state: StepItemState): void {
    this.state.set(state);
  }

  /** 点击时把取值（没设置取值时用下标）回传给父容器，当前步骤与只读时忽略，与上游 `canClick` 一致。 */
  protected handleClick(): void {
    if (!this.clickable()) return;
    this.host?.select(this.value(), this.state().index);
  }

  /** 判断一个取值是不是模板，模板用 `*ngTemplateOutlet` 渲染，其余按文本渲染。 */
  protected asTemplate(value: StepContent): TemplateRef<unknown> | null {
    return value instanceof TemplateRef ? value : null;
  }
}
