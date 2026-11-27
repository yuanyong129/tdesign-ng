import { Component, signal } from '@angular/core';
import { TTextarea, TextareaValidateEvent } from '@tdesign-ng/components';

@Component({
  selector: 'demo-textarea-validate',
  imports: [TTextarea],
  template: `
    <t-textarea [maxcharacter]="6" allowInputOverMax
      placeholder="ASCII 计 1，中文计 2；允许超限以观察校验"
      (validate)="record($event)" (keypress)="keys.set(keys() + 1)" />
    <p aria-live="polite">校验：{{ result() }}；状态变化 {{ changes() }} 次；keypress {{ keys() }} 次</p>
    <t-textarea [maxcharacter]="6" placeholder="不允许超限：中文最多输入 3 个" />
  `,
})
export class DemoTextareaValidate {
  readonly result = signal('正常');
  readonly changes = signal(0);
  readonly keys = signal(0);

  record(context: TextareaValidateEvent): void {
    this.result.set(context.error ?? '正常');
    this.changes.update((value) => value + 1);
  }
}
