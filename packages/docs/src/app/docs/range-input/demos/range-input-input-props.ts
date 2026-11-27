import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TRangeInput } from '@tdesign-ng/components';
import type { InputOptions, RangeInputValue } from '@tdesign-ng/components';

@Component({
  selector: 'demo-range-input-input-props',
  imports: [TRangeInput, ReactiveFormsModule],
  template: `
    <t-range-input [(value)]="value" [inputProps]="options()" clearable
      (change)="changes.update(increment)" (enter)="enters.update(increment)" />
    <p aria-live="polite">范围：{{ value().join(' / ') }}；值变化 {{ changes() }} 次；回车 {{ enters() }} 次。</p>
    <t-range-input [inputProps]="shared" [defaultValue]="['A', 'B']" />
    <t-range-input [disabled]="[false, true]" [inputProps]="{ disabled: false }" [defaultValue]="['左侧', '右侧禁用']" />
    <t-range-input [formControl]="control" [inputProps]="{ disabled: false }" />
    <p>单对象配置两侧，数组分别配置。任何一侧只读或禁用时不显示整体清空按钮。</p>
  `,
})
export class DemoRangeInputInputProps {
  readonly value = signal<RangeInputValue>(['左', 'right']);
  readonly changes = signal(0);
  readonly enters = signal(0);
  readonly callbackChanges = signal(0);
  readonly keys = signal(0);
  readonly increment = (value: number) => value + 1;
  readonly control = new FormControl<RangeInputValue>({value: ['1', '2'], disabled: true}, {nonNullable:true});
  readonly shared: InputOptions = {name:'shared-range', autocomplete:'off', spellCheck:false};
  readonly options = signal<InputOptions[]>([
    {name:'range-start', spellCheck:false, maxcharacter:4,
      onChange: () => this.callbackChanges.update(this.increment), onKeydown: () => this.keys.update(this.increment)},
    {name:'range-end', autocomplete:'off', maxlength:3, readonly:true},
  ]);
}
