import {
  booleanAttribute,
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  contentChildren,
  effect,
  input,
  inject,
  output,
  signal,
  untracked,
  ViewEncapsulation,
} from '@angular/core';
import { TFormItem, type FormItemContext } from './form-item.component';
import type {
  FormLabelAlign,
  FormLayout,
  FormResetType,
  FormRule,
  FormRules,
  FormSubmitResult,
  FormValidateMessage,
} from './form.types';

@Component({
  selector: 't-form',
  templateUrl: './form.component.html',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { '[attr.id]': 'null' },
})
export class TForm {
  /** @zh 实际原生 form 元素的 id @en ID of the native form element @defaultValue undefined */
  readonly id = input<string | undefined>(undefined);
  /**
   * @zh 表单布局：纵向或行内
   * @en Form layout: vertical or inline
   * @defaultValue vertical
   * @values vertical, inline
   */
  readonly layout = input<FormLayout>('vertical');

  /**
   * @zh 标签对齐方式，不设置时纵向布局为 top、行内布局为 right
   * @en Label alignment, defaults to top in vertical layout and right in inline layout
   * @defaultValue undefined
   * @values left, right, top
   */
  readonly labelAlign = input<FormLabelAlign | undefined>(undefined);

  /**
   * @zh 标签宽度
   * @en Label width
   * @defaultValue 100px
   */
  readonly labelWidth = input<string | number>('100px');

  /**
   * @zh 标签文字后是否显示冒号
   * @en Whether to show a colon after the label
   * @defaultValue false
   */
  readonly colon = input(false, { transform: booleanAttribute });

  /**
   * @zh 是否显示必填标记
   * @en Whether to show the required mark
   * @defaultValue true
   */
  readonly requiredMark = input(true, { transform: booleanAttribute });

  /**
   * @zh 是否禁用整个表单
   * @en Whether to disable the whole form
   * @defaultValue false
   */
  readonly disabled = input(false, { transform: booleanAttribute });

  /**
   * @zh 表单级校验规则，按字段名匹配
   * @en Form level validation rules, matched by field name
   * @defaultValue undefined
   */
  readonly rules = input<FormRules | undefined>(undefined);

  /**
   * @zh 必填标记的位置
   * @en Position of the required mark
   * @defaultValue left
   * @values left, right
   */
  readonly requiredMarkPosition = input<'left' | 'right'>('left');

  /**
   * @zh 统一的错误提示文案，设置后覆盖校验结果里的文案
   * @en A unified error message that overrides the message from validation
   * @defaultValue undefined
   */
  readonly errorMessage = input<string | undefined>(undefined);

  /**
   * @zh 是否显示错误提示
   * @en Whether to show the error message
   * @defaultValue true
   */
  readonly showErrorMessage = input(true, { transform: booleanAttribute });

  /**
   * @zh 是否显示校验状态图标
   * @en Whether to show the validation status icon
   * @defaultValue true
   */
  readonly statusIcon = input(true, { transform: booleanAttribute });

  /**
   * @zh 重置时的取值方式：清空或回到初始值
   * @en Reset type: clear or back to the initial value
   * @defaultValue empty
   * @values empty, initial
   */
  readonly resetType = input<FormResetType>('empty');

  /**
   * @zh 是否阻止表单的默认提交行为
   * @en Whether to prevent the default submit behavior
   * @defaultValue true
   */
  readonly preventSubmitDefault = input(true, { transform: booleanAttribute });

  /**
   * @zh 校验失败时是否滚动到第一个出错的表单项
   * @en Whether to scroll to the first invalid field on failure
   * @defaultValue false
   */
  readonly scrollToFirstError = input(false, { transform: booleanAttribute });

  /**
   * @zh 存在 warning 级校验结果时是否允许提交
   * @en Whether to allow submitting when there are warning results
   * @defaultValue false
   */
  readonly submitWithWarningMessage = input(false, { transform: booleanAttribute });

  /** @zh 提交事件 @en Submit event */
  readonly submit = output<FormSubmitResult>();

  /** @zh 重置事件 @en Reset event */
  readonly reset = output<Record<string, unknown>>();

  /** @zh 校验事件 @en Validate event */
  readonly validate = output<FormValidateMessage>();

  private readonly items = contentChildren(TFormItem, { descendants: true });
  private readonly submitting = signal(false);
  private operationVersion = 0;
  private destroyed = false;

  protected readonly effectiveLabelAlign = computed<FormLabelAlign>(
    () => this.labelAlign() ?? (this.layout() === 'vertical' ? 'top' : 'right'),
  );

  protected readonly formClasses = computed(() => {
    const classes = ['t-form'];
    if (this.layout() === 'inline') classes.push('t-form-inline');
    return classes.join(' ');
  });

  constructor() {
    inject(DestroyRef).onDestroy(() => { this.destroyed = true; this.operationVersion++; });
    // 把表单级配置下发给每个表单项
    effect((cleanup) => {
      const context: FormItemContext = {
        layout: this.layout(),
        labelAlign: this.effectiveLabelAlign(),
        labelWidth: this.labelWidth(),
        colon: this.colon(),
        requiredMark: this.requiredMark(),
        requiredMarkPosition: this.requiredMarkPosition(),
        disabled: this.disabled(),
        showErrorMessage: this.showErrorMessage(),
        statusIcon: this.statusIcon(),
        errorMessage: this.errorMessage(),
        rules: this.rules() ?? {},
      };
      const items = this.items();
      untracked(() => {
        for (const item of items) {
          item.setFormContext(context);
        }
      });
      cleanup(() => untracked(() => items.filter((item) => !this.items().includes(item)).forEach((item) => item.clearFormContext())));
    });
  }

  /** 校验整表，返回每个字段的结果。 */
  async validateAll(): Promise<FormValidateMessage> {
    const message = await this.validateItems(this.items().filter((item) => !!item.name()));
    if (this.destroyed || Object.values(message).some((result) => result.stale)) return message;
    this.validate.emit(message);

    if (this.scrollToFirstError()) {
      const firstInvalid = this.items().find((item) => {
        const name = item.name();
        return name ? message[name] && !message[name].result : false;
      });
      firstInvalid?.scrollIntoView();
    }

    return message;
  }

  /** 校验指定字段。 */
  async validateField(names: string | string[]): Promise<FormValidateMessage> {
    const list = Array.isArray(names) ? names : [names];
    const items = this.items().filter((item) => list.includes(item.name() ?? ''));
    return this.validateItems(items);
  }

  private async validateItems(items: readonly TFormItem[]): Promise<FormValidateMessage> {
    const version = this.operationVersion;
    const snapshots = items.map((item) => ({ item, name: item.name(), value: item.getValue() }));
    const results = await Promise.all(items.map((item) => item.validate('submit')));
    const message: FormValidateMessage = {};
    snapshots.forEach(({ item, name, value }, index) => {
      if (!name) return;
      const stale = this.destroyed || version !== this.operationVersion || !this.items().includes(item) || item.name() !== name || item.getValue() !== value;
      const result = results[index];
      message[name] = stale || result.stale ? { result: false, stale: true }
        : result.result ? { result: true } : { ...result, message: this.errorMessage() ?? result.message };
    });
    return message;
  }

  /** 清空校验状态。 */
  clearValidate(names?: string | string[]): void {
    this.operationVersion++;
    const list = names ? (Array.isArray(names) ? names : [names]) : null;
    for (const item of this.items()) {
      if (!list || list.includes(item.name() ?? '')) item.clearValidate();
    }
  }

  /** 取所有字段的值。 */
  getFieldsValue(): Record<string, unknown> {
    const fields: Record<string, unknown> = {};
    for (const item of this.items()) {
      const name = item.name();
      if (name) fields[name] = item.getValue();
    }
    return fields;
  }

  /** 重置表单。 */
  resetForm(): void {
    this.operationVersion++;
    for (const item of this.items()) item.resetField(this.resetType());
    this.clearValidate();
    this.reset.emit(this.getFieldsValue());
  }

  /** 提交表单：先校验，通过后抛出 submit 事件。 */
  async submitForm(): Promise<FormSubmitResult | null> {
    if (this.submitting() || this.destroyed) return null;
    const version = this.operationVersion;
    const items = [...this.items()];
    const snapshots = items.map((item) => ({ name: item.name(), value: item.getValue() }));
    const rules = this.rules();
    this.submitting.set(true);
    try {
      const validateResult = await this.validateAll();
      if (this.destroyed || version !== this.operationVersion || items.length !== this.items().length || items.some((item) => !this.items().includes(item))
        || this.rules() !== rules || items.some((item, index) => item.name() !== snapshots[index].name || item.getValue() !== snapshots[index].value)
        || Object.values(validateResult).some((result) => result.stale)) return null;
      const failed = Object.values(validateResult).filter((result) => !result.result);
      const hasError = failed.some((result) => result.type !== 'warning');
      const hasWarning = failed.length > 0;

      if (hasError || (hasWarning && !this.submitWithWarningMessage())) return null;

      const result: FormSubmitResult = { validateResult, fields: this.getFieldsValue() };
      this.submit.emit(result);
      return result;
    } finally {
      this.submitting.set(false);
    }
  }

  protected handleNativeSubmit(event: Event): void {
    // 原生 submit 会冒泡到 <t-form> 宿主上，与外部的 (submit) 输出同名，
    // 不拦住的话订阅者收到的是原生 Event 而不是 FormSubmitResult。
    event.stopPropagation();
    if (this.preventSubmitDefault()) event.preventDefault();
    void this.submitForm();
  }

  protected handleNativeReset(event: Event): void {
    event.stopPropagation(); event.preventDefault();
    this.resetForm();
  }

  protected isSubmitting(): boolean {
    return this.submitting();
  }
}
