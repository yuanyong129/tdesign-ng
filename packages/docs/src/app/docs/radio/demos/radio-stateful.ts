import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TButton, TRadio, TRadioGroup, type RadioValue } from '@tdesign-ng/components';

@Component({
  selector: 'demo-radio-stateful',
  imports: [TRadio, TRadioGroup, TButton, ReactiveFormsModule],
  template: `
    <div style="display: grid; gap: 20px">
      <t-radio class="stateful-default" [defaultChecked]="initial()" allowUncheck>默认选中，可取消</t-radio>
      <t-radio class="stateful-controlled" [checked]="false" (change)="proposals.set(proposals() + 1)">受控保持未选中</t-radio>
      <t-radio-group class="stateful-group" defaultValue="b" [allowUncheck]="allowUncheck()" [disabled]="disabled()" [readonly]="readonly()" name="stateful-radio"
        (change)="value.set($event.value); groupChanges.set(groupChanges() + 1)">
        <t-radio value="a" disabled>禁用 A</t-radio><t-radio value="b">选项 B</t-radio><t-radio value="c">选项 C</t-radio>
        @if (extra()) { <t-radio value="d">动态选项 D</t-radio> }
      </t-radio-group>
      <t-radio-group class="stateful-rejected-group" value="b" [options]="['b', 'c']" />
      <t-radio class="stateful-form-single" [formControl]="single" allowUncheck>表单单选框</t-radio>
      <t-radio-group class="stateful-form-group" [formControl]="group" [options]="['b', 'c']" />
    </div>
    <p class="demo-hint">组当前 {{ value() }}；change {{ groupChanges() }} 次。Tab 进入当前项，方向键跳过禁用项，Home/End 跳到首尾可选项。</p>
    <t-button size="small" (click)="allowUncheck.set(!allowUncheck())">切换可取消</t-button>
    <t-button size="small" (click)="extra.set(!extra())">增删动态选项</t-button>
    <t-button size="small" (click)="readonly.set(!readonly())">切换只读</t-button>
    <t-button size="small" (click)="disabled.set(!disabled())">切换禁用</t-button>
    <t-button size="small" (click)="single.reset(); group.reset()">重置表单</t-button>
  `,
})
export class DemoRadioStateful {
  readonly initial = signal(true);
  readonly allowUncheck = signal(true);
  readonly disabled = signal(false);
  readonly readonly = signal(false);
  readonly extra = signal(false);
  readonly value = signal<RadioValue | undefined>('b');
  readonly proposals = signal(0);
  readonly groupChanges = signal(0);
  readonly single = new FormControl(true, { nonNullable: true, updateOn: 'blur' });
  readonly group = new FormControl<RadioValue>('b', { nonNullable: true, updateOn: 'blur' });
}
