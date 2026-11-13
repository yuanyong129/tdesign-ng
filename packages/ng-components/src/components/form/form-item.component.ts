import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  computed,
  contentChild,
  effect,
  ElementRef,
  inject,
  input,
  signal,
  untracked,
  ViewEncapsulation,
} from '@angular/core';
import { NgControl } from '@angular/forms';
import { toRuleArray, triggersAt, validateRules } from './form-rule';
import type { FormLabelAlign, FormRule, FormValidateResult, FormValidateStatus } from './form.types';

/** 由 t-form 下发的上下文。 */
export interface FormItemContext {
  layout: 'vertical' | 'inline';
  labelAlign: FormLabelAlign;
  labelWidth: string | number;
  colon: boolean;
  requiredMark: boolean;
  requiredMarkPosition: 'left' | 'right';
  disabled: boolean;
  showErrorMessage: boolean;
  statusIcon: boolean;
  rules: Record<string, FormRule | FormRule[]>;
}

const STATUS_CLASS: Record<FormValidateStatus, string> = {
  success: 't-is-success',
  warning: 't-is-warning',
  error: 't-is-error',
};

/** 可选的布尔输入：不传时保持 undefined，以便回落到表单级配置。 */
const optionalBoolean = (value: unknown): boolean | undefined =>
  value === undefined || value === null || value === '' ? undefined : booleanAttribute(value);

@Component({
  selector: 't-form-item',
  templateUrl: './form-item.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: {
    '[class]': 'itemClasses()',
    '(focusout)': 'handleFocusOut()',
  },
})
export class TFormItem {
  /**
   * @zh 字段名，用于匹配校验规则与取值
   * @en Field name, used to match rules and collect values
   * @defaultValue undefined
   */
  readonly name = input<string | undefined>(undefined);

  /**
   * @zh 标签文本
   * @en Label text
   * @defaultValue undefined
   */
  readonly label = input<string | undefined>(undefined);

  /**
   * @zh 校验规则，优先于表单级的同名规则
   * @en Validation rules, take precedence over form level rules with the same name
   * @defaultValue undefined
   */
  readonly rules = input<FormRule | FormRule[] | undefined>(undefined);

  /**
   * @zh 帮助文字，显示在控件下方并参与布局
   * @en Help text, displayed below the control and occupying layout space
   * @defaultValue undefined
   */
  readonly help = input<string | undefined>(undefined);

  /**
   * @zh 提示文字，显示在控件下方但不占位
   * @en Tips text, displayed below the control without occupying layout space
   * @defaultValue undefined
   */
  readonly tips = input<string | undefined>(undefined);

  /**
   * @zh 手动指定校验状态，用于服务端校验等场景
   * @en Manually set the validate status, e.g. for server side validation
   * @defaultValue undefined
   * @values default, success, warning, error
   */
  readonly status = input<FormValidateStatus | '' | undefined>(undefined);

  /**
   * @zh 是否显示校验状态图标
   * @en Whether to show the status icon
   * @defaultValue undefined
   */
  readonly statusIcon = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  /**
   * @zh 是否显示成功态边框
   * @en Whether to show a success border
   * @defaultValue undefined
   */
  readonly successBorder = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  /**
   * @zh 是否显示必填标记
   * @en Whether to show the required mark
   * @defaultValue undefined
   */
  readonly requiredMark = input<boolean | undefined, unknown>(undefined, { transform: optionalBoolean });

  /**
   * @zh 标签对齐方式
   * @en Label alignment
   * @defaultValue undefined
   * @values left, right, top
   */
  readonly labelAlign = input<FormLabelAlign | undefined>(undefined);

  /**
   * @zh 标签宽度
   * @en Label width
   * @defaultValue undefined
   */
  readonly labelWidth = input<string | number | undefined>(undefined);

  /**
   * @zh 是否显示错误信息
   * @en Whether to show the error message
   * @defaultValue undefined
   */
  readonly showErrorMessage = input<boolean | undefined, unknown>(undefined, {
    transform: optionalBoolean,
  });

  /**
   * @zh 标签的 for 属性，指向控件 id
   * @en The for attribute of the label, pointing to the control id
   * @defaultValue undefined
   */
  readonly for = input<string | undefined>(undefined);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly ngControl = contentChild(NgControl);

  private readonly context = signal<FormItemContext | null>(null);
  private readonly message = signal('');
  private readonly validated = signal<FormValidateStatus | null>(null);
  private initialValue: unknown = undefined;
  private initialValueCaptured = false;

  protected readonly effectiveLabelAlign = computed(
    () => this.labelAlign() ?? this.context()?.labelAlign ?? 'right',
  );

  protected readonly effectiveLabelWidth = computed(
    () => this.labelWidth() ?? this.context()?.labelWidth ?? '100px',
  );

  protected readonly rulesToUse = computed<FormRule[]>(() => {
    const own = toRuleArray(this.rules());
    if (own.length) return own;
    const name = this.name();
    const formRules = this.context()?.rules;
    if (!name || !formRules) return [];
    return toRuleArray(formRules[name]);
  });

  protected readonly isRequired = computed(() =>
    this.rulesToUse().some((rule) => rule.required === true),
  );

  protected readonly showRequiredMark = computed(() => {
    const mark = this.requiredMark();
    if (mark !== undefined) return mark && this.isRequired();
    return (this.context()?.requiredMark ?? true) && this.isRequired();
  });

  protected readonly validateStatus = computed<FormValidateStatus | ''>(
    () => this.status() ?? this.validated() ?? '',
  );

  protected readonly showMessage = computed(() => {
    const show = this.showErrorMessage() ?? this.context()?.showErrorMessage ?? true;
    return show && !!this.message();
  });

  protected readonly displayMessage = computed(() => (this.showMessage() ? this.message() : ''));

  protected readonly itemClasses = computed(() => {
    const classes = ['t-form__item'];
    if (this.help()) classes.push('t-form__item-with-help');
    if (this.displayMessage() || (this.tips() && !this.help())) classes.push('t-form__item-with-extra');
    return classes.join(' ');
  });

  protected readonly labelClasses = computed(() => {
    const align = this.effectiveLabelAlign();
    const classes = ['t-form__label', `t-form__label--${align}`];
    if (this.showRequiredMark()) {
      classes.push('t-form__label--required');
      if ((this.context()?.requiredMarkPosition ?? 'left') === 'right') {
        classes.push('t-form__label--required-right');
      }
    }
    if (this.context()?.colon) classes.push('t-form__label--colon');
    return classes.join(' ');
  });

  protected readonly labelStyle = computed(() => {
    if (this.effectiveLabelAlign() === 'top') return {};
    const width = this.effectiveLabelWidth();
    return { width: typeof width === 'number' ? `${width}px` : width };
  });

  protected readonly controlsClasses = computed(() => {
    const status = this.validateStatus();
    const classes = ['t-form__controls'];
    if (status) classes.push(STATUS_CLASS[status]);
    if (this.successBorder()) classes.push('t-form--success-border');
    return classes.join(' ');
  });

  constructor() {
    // 表单禁用时把控件一并禁用
    effect(() => {
      const disabled = this.context()?.disabled ?? false;
      const control = this.ngControl();
      untracked(() => {
        if (!control?.control) return;
        if (disabled) {
          control.control.disable({ emitEvent: false });
        } else if (control.control.disabled) {
          control.control.enable({ emitEvent: false });
        }
      });
    });

    // 值变化时按 change 时机校验；已经报错的项改为实时校验，便于即时消除错误
    effect((onCleanup) => {
      const control = this.ngControl()?.control;
      if (!control) return;
      const subscription = control.valueChanges.subscribe(() => {
        void this.validate('change', !!this.validateStatus());
      });
      onCleanup(() => subscription.unsubscribe());
    });
  }

  /** 由 t-form 调用，下发上下文。 */
  setFormContext(context: FormItemContext): void {
    this.context.set(context);
  }

  /** 读取当前控件的值。 */
  getValue(): unknown {
    const control = this.ngControl();
    return control?.control?.value ?? control?.value;
  }

  /** 按指定时机校验，返回校验结果。 */
  async validate(
    trigger: 'blur' | 'change' | 'submit' = 'submit',
    force = false,
  ): Promise<FormValidateResult> {
    const rules = this.rulesToUse().filter((rule) => force || triggersAt(rule, trigger));
    if (!rules.length) {
      if (trigger === 'submit') this.clearValidate();
      return { result: true };
    }

    const result = await validateRules(this.getValue(), rules, { name: this.name() ?? '' });

    if (result.result) {
      this.clearValidate();
    } else {
      this.validated.set(result.type === 'warning' ? 'warning' : 'error');
      this.message.set(result.message ?? '校验未通过');
    }

    return result;
  }

  /** 清空校验状态。 */
  clearValidate(): void {
    this.validated.set(null);
    this.message.set('');
  }

  /** 重置为初始值并清空校验状态。 */
  resetField(): void {
    const control = this.ngControl()?.control;
    if (!control) return;
    control.reset(this.initialValueCaptured ? this.initialValue : control.value);
    this.clearValidate();
  }

  /** 记录初始值，供 reset() 回滚。 */
  captureInitialValue(): void {
    if (this.initialValueCaptured) return;
    this.initialValue = this.getValue();
    this.initialValueCaptured = true;
  }

  /** 把该项滚动到可见区域，用于 scrollToFirstError。 */
  scrollIntoView(): void {
    this.host.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  protected handleFocusOut(): void {
    void this.validate('blur');
  }
}
