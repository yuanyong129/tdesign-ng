import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TButton, TSelectInput, type InputOptions, type SelectInputTagInputProps, type SelectInputTagProps, type SelectInputValue } from '@tdesign-ng/components';

@Component({
  selector: 'demo-select-input-options',
  imports: [TSelectInput, TButton, ReactiveFormsModule],
  template: `
    <div style="display: grid; gap: 28px; max-width: 520px">
      <t-select-input class="options-single" allowInput clearable value="单选回显" [inputValue]="keyword()" [inputProps]="inputProps()" [panel]="singlePanel"
        [disabled]="disabled()" [readonly]="readonly()" [popupVisible]="visible()" (inputChange)="acceptInput($event.value)" (enter)="enters.set(enters() + 1)" (paste)="pastes.set(pastes() + 1)"
        (mouseenter)="mouseEnters.set(mouseEnters() + 1)" (mouseleave)="mouseLeaves.set(mouseLeaves() + 1)" />
      <ng-template #singlePanel><t-button size="small" variant="outline" type="button" class="single-panel-button">面板内可聚焦按钮</t-button></ng-template>
      <t-select-input class="options-multiple" multiple allowInput clearable [value]="tags()" [panel]="multiplePanel" [inputProps]="sharedProps()"
        [tagInputProps]="tagInputProps()" [tagProps]="tagProps()" [defaultInputValue]="initialKeyword()" [reserveKeyword]="reserve()"
        (valueChange)="acceptTags($event)" (tagChange)="tagChanges.set(tagChanges() + 1)" (inputChange)="multiInputs.set(multiInputs() + 1)" />
      <ng-template #multiplePanel><t-button size="small" variant="outline" type="button" class="multiple-panel-button">多选面板按钮</t-button></ng-template>
      <t-select-input class="options-form" multiple allowInput clearable [formControl]="control" [panel]="formPanel" />
      <ng-template #formPanel><t-button size="small" variant="outline" type="button" class="form-panel-button">表单面板按钮</t-button></ng-template>
    </div>
    <p class="demo-hint">单选关键字 {{ keyword() }}；inputProps 回调 {{ inputs() }} 次；Enter {{ enters() }} 次；paste {{ pastes() }} 次。多选 tagChange {{ tagChanges() }} 次，配置回调 {{ tagCallbacks() }} 次；关闭回调 {{ closes() }} 次。</p>
    <t-button size="small" (click)="acceptChanges.set(!acceptChanges())">切换接收修改</t-button>
    <t-button size="small" (click)="disabled.set(!disabled())">切换单选禁用</t-button>
    <t-button size="small" (click)="readonly.set(!readonly())">切换单选只读</t-button>
    <t-button size="small" (click)="reserve.set(!reserve())">切换保留关键字</t-button>
    <t-button size="small" (click)="control.reset()">重置表单</t-button>
  `,
})
export class DemoSelectInputOptions {
  readonly keyword = signal('');
  readonly visible = signal<boolean | undefined>(undefined);
  readonly tags = signal<SelectInputValue>(['第一个', '第二个', '第三个']);
  readonly initialKeyword = signal('初始');
  readonly disabled = signal(false);
  readonly readonly = signal(false);
  readonly reserve = signal(false);
  readonly acceptChanges = signal(true);
  readonly inputs = signal(0);
  readonly enters = signal(0);
  readonly pastes = signal(0);
  readonly mouseEnters = signal(0);
  readonly mouseLeaves = signal(0);
  readonly tagChanges = signal(0);
  readonly tagCallbacks = signal(0);
  readonly multiInputs = signal(0);
  readonly multiCallbacks = signal(0);
  readonly closes = signal(0);
  readonly inputProps = signal<InputOptions>({
    name: 'single-search', autocomplete: 'off', spellCheck: false, maxcharacter: 6,
    onChange: () => this.inputs.update((n) => n + 1),
  });
  readonly sharedProps = signal<InputOptions>({ name: 'shared-search', maxlength: 8 });
  readonly tagInputProps = signal<SelectInputTagInputProps>({
    inputProps: { name: 'nested-search', maxcharacter: 4 },
    tagProps: { theme: 'danger', shape: 'round', maxWidth: 80, onClose: () => this.closes.update((n) => n + 1) },
    onChange: () => this.tagCallbacks.update((n) => n + 1),
    onInputChange: () => this.multiCallbacks.update((n) => n + 1),
  });
  readonly tagProps = signal<SelectInputTagProps>({ theme: 'primary' });
  readonly control = new FormControl<SelectInputValue>(['表单', '可删除'], { nonNullable: true, updateOn: 'blur' });
  acceptInput(value: string): void { if (this.acceptChanges()) this.keyword.set(value); }
  acceptTags(value: SelectInputValue): void { if (this.acceptChanges()) this.tags.set(value); }
}
