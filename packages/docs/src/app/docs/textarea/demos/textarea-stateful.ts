import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TButton, TTextarea, type TextareaValue } from '@tdesign-ng/components';

@Component({
  selector: 'demo-textarea-stateful',
  imports: [TTextarea, TButton, ReactiveFormsModule],
  template: `
    <div style="display: grid; gap: 28px; max-width: 520px">
      <t-textarea class="stateful-default" [defaultValue]="initial()" [autosize]="rows()" />
      <t-textarea class="stateful-controlled" [value]="value()" (valueChange)="accept($event)"
        [maxlength]="3" [maxcharacter]="2" [disabled]="disabled()" [readonly]="readonly()"
        (change)="changes.set(changes() + 1)" (keydown)="keys.set(keys() + 1)" />
      <t-textarea class="stateful-form" [formControl]="control" defaultValue="不覆盖表单" autosize />
    </div>
    <p class="demo-hint">受控值：{{ value() }}；change {{ changes() }} 次。maxlength 与 maxcharacter 同时设置时，优先使用 maxlength 的码点计数。</p>
    <t-button size="small" (click)="acceptChanges.set(!acceptChanges())">切换接收修改</t-button>
    <t-button size="small" (click)="readonly.set(!readonly())">切换只读</t-button>
    <t-button size="small" (click)="disabled.set(!disabled())">切换禁用</t-button>
    <t-button size="small" (click)="control.reset()">重置表单</t-button>
  `,
})
export class DemoTextareaStateful {
  readonly initial = signal<TextareaValue>('默认内容');
  readonly value = signal<TextareaValue>('a');
  readonly rows = signal<boolean | { minRows: number; maxRows: number }>({ minRows: 2, maxRows: 4 });
  readonly acceptChanges = signal(true);
  readonly disabled = signal(false);
  readonly readonly = signal(false);
  readonly changes = signal(0);
  readonly keys = signal(0);
  readonly control = new FormControl('表单默认', { nonNullable: true, updateOn: 'blur' });
  accept(value: TextareaValue): void { if (this.acceptChanges()) this.value.set(value); }
}
