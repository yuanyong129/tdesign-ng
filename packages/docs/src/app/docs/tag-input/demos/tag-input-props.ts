import { Component, computed, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TButton, TTagInput } from '@tdesign-ng/components';
import type { InputOptions, TagInputTagProps, TagInputValue } from '@tdesign-ng/components';

@Component({
  selector: 'demo-tag-input-props',
  imports: [TButton, TTagInput, ReactiveFormsModule],
  template: `
    <t-tag-input [(value)]="value" [inputProps]="options()" [tagProps]="tags()"
      [minCollapsedNum]="2" clearable (inputChange)="inputChanges.update(increment)"
      (remove)="removes.update(increment)" />
    <p aria-live="polite">标签 {{ value().join(', ') }}；输入 {{ inputChanges() }} 次；删除 {{ removes() }} 次；关闭回调 {{ closes() }} 次。</p>
    <t-button variant="text" (click)="readonly.set(!readonly())">切换只读</t-button>
    <t-tag-input disabled [defaultValue]="['禁用']" [inputProps]="{ disabled: false }" />
    <t-tag-input [formControl]="control" [inputProps]="{ disabled: false }" />
    <p>输入值和标签列表由 TagInput 管理；tagProps 设置单项外观，折叠计数保留默认样式。</p>
  `,
})
export class DemoTagInputProps {
  readonly value = signal<TagInputValue>(['第一个长标签', '第二个', '第三个']);
  readonly readonly = signal(false);
  readonly inputChanges = signal(0);
  readonly removes = signal(0);
  readonly closes = signal(0);
  readonly callbacks = signal(0);
  readonly keys = signal(0);
  readonly compositions = signal(0);
  readonly increment = (value: number) => value + 1;
  readonly control = new FormControl<TagInputValue>({value:['表单禁用'], disabled:true}, {nonNullable:true});
  readonly options = computed<InputOptions>(() => ({
    name:'tags', autocomplete:'off', spellCheck:false, maxcharacter:4,
    readonly:this.readonly(), onChange: () => this.callbacks.update(this.increment),
    onKeydown: () => this.keys.update(this.increment),
    onCompositionend: () => this.compositions.update(this.increment),
  }));
  readonly tags = signal<TagInputTagProps>({
    theme:'success', variant:'light', shape:'round', color:'#0052d9', maxWidth:80, title:true,
    onClose: () => this.closes.update(this.increment),
  });
}
