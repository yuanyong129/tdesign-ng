import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TAutoComplete, TButton, type AutoCompleteInputProps, type AutoCompletePopupProps, type AutoCompleteOption } from '@tdesign-ng/components';

@Component({
  selector: 'demo-auto-complete-options',
  imports: [TAutoComplete, TButton, ReactiveFormsModule],
  template: `
    <div style="display: grid; gap: 28px; max-width: 520px">
      <t-auto-complete class="options-controlled" [value]="value()" [options]="options()" [filterable]="filterable()" clearable
        [inputProps]="inputProps()" [popupProps]="popupProps()" [disabled]="disabled()" [readonly]="readonly()"
        (valueChange)="accept($event)" (select)="selects.set(selects() + 1)" (enter)="enters.set(enters() + 1)" />
      <t-auto-complete class="options-default" [defaultValue]="initial()" [options]="['first', 'second', 'third']" clearable />
      <t-auto-complete class="options-form" [formControl]="control" [options]="['form', 'next']" [panelBottomContent]="footer" />
      <ng-template #footer><t-button size="small" variant="outline" type="button" class="auto-panel-button">面板辅助操作</t-button></ng-template>
      <t-auto-complete class="options-custom" [triggerElement]="trigger" [options]="['custom-a', 'custom-b']" [filterable]="false"
        (select)="customValue.set($event.value)" />
      <ng-template #trigger><t-button size="small" variant="outline" type="button">聚焦后用方向键选择</t-button></ng-template>
    </div>
    <p class="demo-hint">当前 {{ value() }}；select {{ selects() }} 次，Enter {{ enters() }} 次；输入配置回调 {{ inputs() }} 次。自定义触发器选择：{{ customValue() }}</p>
    <t-button size="small" (click)="acceptChanges.set(!acceptChanges())">切换接收修改</t-button>
    <t-button size="small" (click)="disabled.set(!disabled())">切换禁用</t-button>
    <t-button size="small" (click)="readonly.set(!readonly())">切换只读</t-button>
    <t-button size="small" (click)="filterable.set(!filterable())">切换本地过滤</t-button>
    <t-button size="small" (click)="control.reset()">重置表单</t-button>
  `,
})
export class DemoAutoCompleteOptions {
  readonly value = signal('');
  readonly options = signal<AutoCompleteOption[]>(['alpha', 'alpine', 'beta', '中文', '中文候选']);
  readonly initial = signal('first');
  readonly acceptChanges = signal(true);
  readonly filterable = signal(true);
  readonly disabled = signal(false);
  readonly readonly = signal(false);
  readonly selects = signal(0);
  readonly enters = signal(0);
  readonly inputs = signal(0);
  readonly keys = signal(0);
  readonly compositions = signal(0);
  readonly customValue = signal('');
  readonly inputProps = signal<AutoCompleteInputProps>({
    name: 'auto-search', autocomplete: 'off', spellCheck: false, maxcharacter: 6,
    onChange: () => this.inputs.update((n) => n + 1),
    onKeydown: () => this.keys.update((n) => n + 1),
    onCompositionend: () => this.compositions.update((n) => n + 1),
  });
  readonly popupProps = signal<AutoCompletePopupProps>({
    placement: 'bottom-right', showArrow: true, destroyOnClose: true,
    overlayClassName: ['auto-options-popup'], overlayInnerClassName: { 'auto-options-inner': true }, zIndex: 2300,
  });
  readonly control = new FormControl('form', { nonNullable: true, updateOn: 'blur' });
  accept(value: string): void { if (this.acceptChanges()) this.value.set(value); }
}
