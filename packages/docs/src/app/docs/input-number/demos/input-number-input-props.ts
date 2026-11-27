import { Component, computed, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TButton, TInputNumber } from '@tdesign-ng/components';
import type { InputOptions } from '@tdesign-ng/components';

@Component({
  selector: 'demo-input-number-input-props',
  imports: [TButton, TInputNumber, ReactiveFormsModule],
  template: `
    <t-input-number [(value)]="value" [inputProps]="options()" [min]="0" [max]="9999" />
    <p aria-live="polite">数值 {{ value() }}；输入回调 {{ changes() }} 次；按键回调 {{ keys() }} 次。</p>
    <t-button variant="text" (click)="readonly.set(!readonly())">切换只读</t-button>
    <t-input-number disabled [inputProps]="{ disabled: false }" [defaultValue]="7" />
    <t-input-number [formControl]="control" [inputProps]="{ name: 'form-amount', disabled: false }" />
    <p>inputProps 只配置原生编辑区白名单，不覆盖数值、步长、格式化、尺寸和校验状态。</p>
  `,
})
export class DemoInputNumberInputProps {
  readonly value = signal<number | string | undefined>(12);
  readonly changes = signal(0);
  readonly keys = signal(0);
  readonly readonly = signal(false);
  readonly control = new FormControl({value: 9, disabled: true}, {nonNullable:true});
  readonly options = computed<InputOptions>(() => ({
    name: 'amount', autocomplete: 'off', spellCheck: false, maxlength: 3,
    readonly: this.readonly(), onChange: () => this.changes.update(value => value + 1),
    onKeydown: () => this.keys.update(value => value + 1),
  }));
}
