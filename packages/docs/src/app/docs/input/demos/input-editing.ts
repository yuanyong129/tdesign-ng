import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TButton, TInput } from '@tdesign-ng/components';
import type { InputCompositionEvent, InputPasteEvent, InputValidateEvent, InputValue } from '@tdesign-ng/components';

@Component({
  selector: 'demo-input-editing',
  imports: [TInput, TButton, ReactiveFormsModule],
  template: `
    <div style="display: grid; gap: 28px; max-width: 520px">
      <t-input class="editing-weighted" [value]="value()" [maxcharacter]="6" [allowInputOverMax]="overflow()"
        showLimitNumber clearable [disabled]="disabled()" [readonly]="readonly()" [inputClass]="inputClass()"
        placeholder="输入中文或 emoji" (valueChange)="accept($event)" (change)="changes.set(changes() + 1)"
        (validate)="recordValidation($event)"
        (compositionstart)="recordComposition($event)" (compositionend)="recordComposition($event)"
        (keypress)="keys.set(keys() + 1)" (enter)="enters.set(enters() + 1)"
        (paste)="recordPaste($event)" (wheel)="wheels.set(wheels() + 1)"
        (mouseenter)="mouseEnters.set(mouseEnters() + 1)" (mouseleave)="mouseLeaves.set(mouseLeaves() + 1)" />
      <t-input class="editing-default" [defaultValue]="initial()" clearable placeholder="非受控初始值" />
      <t-input class="editing-form" [formControl]="control" defaultValue="不会覆盖表单值" clearable />
      <t-input class="editing-auto" [autoWidth]="autoWidth()" [value]="autoValue()" (valueChange)="autoValue.set($event)"
        [placeholder]="autoPlaceholder()" [size]="autoSize()" label="名称" clearable />
      <t-input class="editing-formatted" [format]="uppercase" [maxlength]="4" placeholder="大写并限制 4 个码点" />
    </div>
    <p class="demo-hint">当前 {{ value() }}；change {{ changes() }} 次；组合事件 {{ compositions().length }} 次；校验 {{ errors().join(', ') }}；最近粘贴：{{ pasted() }}</p>
    <t-button size="small" (click)="overflow.set(!overflow())">切换允许超限</t-button>
    <t-button size="small" (click)="disabled.set(!disabled())">切换禁用</t-button>
    <t-button size="small" (click)="readonly.set(!readonly())">切换只读</t-button>
    <t-button size="small" (click)="control.reset()">重置表单</t-button>
  `,
})
export class DemoInputEditing {
  protected readonly value = signal<InputValue>('');
  protected readonly initial = signal<InputValue>('初始值');
  protected readonly autoValue = signal<InputValue>('短名称');
  protected readonly autoPlaceholder = signal('请输入名称');
  protected readonly autoSize = signal<'small' | 'medium' | 'large'>('medium');
  protected readonly autoWidth = signal(true);
  protected readonly inputClass = signal<string | string[] | Record<string, boolean>>({ 'editing-inner': true });
  protected readonly control = new FormControl('表单初始值', { nonNullable: true });
  protected readonly overflow = signal(false);
  protected readonly disabled = signal(false);
  protected readonly readonly = signal(false);
  protected readonly acceptChanges = signal(true);
  protected readonly changes = signal(0);
  protected readonly compositions = signal<string[]>([]);
  protected readonly errors = signal<string[]>([]);
  protected readonly keys = signal(0);
  protected readonly enters = signal(0);
  protected readonly wheels = signal(0);
  protected readonly mouseEnters = signal(0);
  protected readonly mouseLeaves = signal(0);
  protected readonly pasted = signal('');
  protected readonly uppercase = (value: string) => value.toUpperCase();
  protected accept(value: InputValue): void { if (this.acceptChanges()) this.value.set(value); }
  protected recordComposition(event: InputCompositionEvent): void { this.compositions.update((values) => [...values, event.value]); }
  protected recordPaste(event: InputPasteEvent): void { this.pasted.set(event.pasteValue); }
  protected recordValidation(event: InputValidateEvent): void { this.errors.update((values) => [...values, event.error ?? 'valid']); }
}
