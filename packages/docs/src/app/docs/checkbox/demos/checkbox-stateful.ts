import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TButton, TCheckbox, TCheckboxGroup, type CheckboxGroupValue } from '@tdesign-ng/components';

@Component({
  selector: 'demo-checkbox-stateful',
  imports: [TCheckbox, TCheckboxGroup, TButton, ReactiveFormsModule],
  template: `
    <div style="display: grid; gap: 20px">
      <t-checkbox class="stateful-default" [defaultChecked]="initial()">默认选中</t-checkbox>
      <t-checkbox class="stateful-controlled" [checked]="false" (change)="proposals.set(proposals() + 1)">受控保持未选中</t-checkbox>
      <t-checkbox-group class="stateful-group" [defaultValue]="['locked']" [max]="max()" [disabled]="disabled()" [readonly]="readonly()" name="stateful-checkbox"
        (change)="groupChanges.set(groupChanges() + 1); value.set($event.value)">
        <t-checkbox checkAll>全选</t-checkbox>
        <t-checkbox value="locked" disabled>固定选中</t-checkbox>
        <t-checkbox [value]="dynamicValue()">选项 A</t-checkbox>
        <t-checkbox value="b">选项 B</t-checkbox>
        @if (extra()) { <t-checkbox value="c">动态选项 C</t-checkbox> }
      </t-checkbox-group>
      <t-checkbox-group class="stateful-rejected-group" [value]="['a']" [options]="['a', 'b']" />
      <t-checkbox class="stateful-form-single" [formControl]="single">表单复选框</t-checkbox>
      <t-checkbox-group class="stateful-form-group" [formControl]="group" [options]="['a', 'b', 'c']" />
    </div>
    <p class="demo-hint">最多选 {{ max() }} 项（含固定选中项）；当前 {{ value().join(', ') }}；组 change {{ groupChanges() }} 次。全选保留禁用/只读项并遵守上限。</p>
    <t-button size="small" (click)="extra.set(!extra())">增删动态选项</t-button>
    <t-button size="small" (click)="readonly.set(!readonly())">切换只读</t-button>
    <t-button size="small" (click)="disabled.set(!disabled())">切换禁用</t-button>
    <t-button size="small" (click)="single.reset(); group.reset()">重置表单</t-button>
  `,
})
export class DemoCheckboxStateful {
  readonly initial = signal(true);
  readonly max = signal(2);
  readonly disabled = signal(false);
  readonly readonly = signal(false);
  readonly extra = signal(false);
  readonly dynamicValue = signal('a');
  readonly value = signal<CheckboxGroupValue>(['locked']);
  readonly proposals = signal(0);
  readonly groupChanges = signal(0);
  readonly single = new FormControl(true, { nonNullable: true, updateOn: 'blur' });
  readonly group = new FormControl<CheckboxGroupValue>(['a'], { nonNullable: true, updateOn: 'blur' });
}
