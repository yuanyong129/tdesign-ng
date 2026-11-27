import { booleanAttribute, ChangeDetectionStrategy, Component, input, ViewEncapsulation } from '@angular/core';

/** 输入框组合；投影的输入框保留独立状态与表单绑定。 */
@Component({
  selector: 't-input-group',
  standalone: true,
  template: '<ng-content />',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  host: { class: 't-input-group', '[class.t-input-group--separate]': 'separate()', role: 'group' },
})
export class TInputGroup {
  /** @zh 是否在输入框之间显示间距 @en Whether to separate the inputs @defaultValue false */
  readonly separate = input(false, { transform: booleanAttribute });
}
