import { NgTemplateOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  TemplateRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  output,
  signal,
} from '@angular/core';
import { TCheckTag } from './check-tag.component';
import type {
  CheckTagChangeEvent,
  CheckTagContent,
  CheckTagGroupChangeEvent,
  CheckTagGroupOption,
  CheckTagGroupValue,
  CheckTagSize,
} from './check-tag.types';

/** 渲染一项标签所需的派生数据。 */
interface PreparedOption {
  option: CheckTagGroupOption;
  value: string | number;
  disabled: boolean;
  size: CheckTagSize;
  template: TemplateRef<unknown> | null;
  text: string;
}

/**
 * 可选标签组。
 *
 * ```html
 * <t-check-tag-group [options]="options" [(value)]="value" [multiple]="true" />
 * ```
 *
 * 视觉样式全部来自 tdesign-common（`@tdesign-ng/styles`）：容器类 `t-check-tag-group`
 * 直接挂在宿主元素上，与 `t-check-tag` 宿主上的 `t-tag` 互为相邻兄弟，
 * 上游的 `.t-check-tag-group .t-tag:not(:last-child)` 间距规则才能命中。
 */
@Component({
  selector: 't-check-tag-group',
  standalone: true,
  imports: [NgTemplateOutlet, TCheckTag],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    @for (entry of preparedOptions(); track entry.value) {
      <t-check-tag
        [value]="entry.value"
        [checked]="isChecked(entry.value)"
        [disabled]="entry.disabled"
        [size]="entry.size"
        (change)="handleChange($event, entry.option)"
      >
        @if (entry.template; as template) {
          <ng-container *ngTemplateOutlet="template" />
        } @else {
          {{ entry.text }}
        }
      </t-check-tag>
    }
  `,
  host: {
    '[class]': 'classes()',
  },
})
export class TCheckTagGroup {
  /** 选项列表。 @zh 选项列表 @en Options of the group */
  readonly options = input<ReadonlyArray<CheckTagGroupOption> | undefined>(undefined);

  /** 选中的值列表，传值时受控。 @zh 选中的值列表 @en Value of the group */
  readonly value = input<CheckTagGroupValue | undefined>(undefined);

  /** 非受控模式下的初始值列表。 @zh 初始值列表 @en Default value @defaultValue [] */
  readonly defaultValue = input<CheckTagGroupValue>([]);

  /** 是否允许多选。 @zh 是否多选 @en Whether multiple selection is allowed @defaultValue false */
  readonly multiple = input(false, { transform: booleanAttribute });

  /** 值变化事件，用于双向绑定。 @zh 值变化 @en Value change event */
  readonly valueChange = output<CheckTagGroupValue>();

  /** 值变化事件，携带触发来源与当前选项。 @zh 值变化（带上下文） @en Change event with context */
  readonly change = output<CheckTagGroupChangeEvent>();

  /** 非受控模式下的值列表。 */
  private readonly valueOverride = signal<CheckTagGroupValue | null>(null);

  protected readonly classes = computed(() => 't-check-tag-group');

  /** 受控 `value` 优先，其次用户点击，最后 `defaultValue`。 */
  protected readonly mergedValue = computed<CheckTagGroupValue>(
    () => this.value() ?? this.valueOverride() ?? this.defaultValue(),
  );

  protected readonly preparedOptions = computed<ReadonlyArray<PreparedOption>>(() =>
    (this.options() ?? []).map((option) => {
      const content = option.label ?? option.content ?? option.default;
      const template = content instanceof TemplateRef ? content : null;
      const text = typeof content === 'string' ? content : String(option.value);
      return {
        option,
        value: option.value,
        disabled: !!option.disabled,
        size: option.size ?? 'medium',
        template,
        text,
      };
    }),
  );

  protected isChecked(value: string | number): boolean {
    return this.mergedValue().includes(value);
  }

  protected handleChange(event: CheckTagChangeEvent, option: CheckTagGroupOption): void {
    const current = this.mergedValue();
    const next = event.checked
      ? this.multiple()
        ? [...current, option.value]
        : [option.value]
      : this.multiple()
        ? current.filter((item) => item !== option.value)
        : [];
    this.valueOverride.set(next);
    this.valueChange.emit(next);
    this.change.emit({
      value: next,
      checked: event.checked,
      type: event.checked ? 'check' : 'uncheck',
      current: option,
      event: event.event,
    });
  }
}
