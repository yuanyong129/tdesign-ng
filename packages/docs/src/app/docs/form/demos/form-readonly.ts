import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import {
  TAutoComplete, TButton, TCheckbox, TCheckboxGroup, TDateRangePicker, TForm, TFormItem,
  TInput, TInputNumber, TRadio, TRadioGroup, TRangeInput, TSelect, TSelectInput, TSwitch,
  TTagInput, TTextarea, type DateRangeValue, type RangeInputValue, type SelectInputValue,
} from '@tdesign-ng/components';

@Component({
  selector: 'demo-form-readonly',
  imports: [ReactiveFormsModule, TForm, TFormItem, TInput, TTextarea, TInputNumber, TRangeInput,
    TTagInput, TCheckbox, TCheckboxGroup, TRadio, TRadioGroup, TSelect, TSelectInput, TAutoComplete,
    TDateRangePicker, TButton, TSwitch],
  template: `
    <t-button size="small" (click)="readonly.set(!readonly())">切换表单只读</t-button>
    <t-button size="small" (click)="extra.set(!extra())">增删字段</t-button>
    <t-form class="readonly-form" [readonly]="readonly()">
      <t-form-item label="文本" name="text"><t-input class="ro-input" [formControl]="text" clearable [readonly]="false" /></t-form-item>
      <t-form-item label="始终只读"><t-input class="ro-explicit" readonly defaultValue="始终只读" /></t-form-item>
      <t-form-item label="多行"><t-textarea class="ro-textarea" defaultValue="多行内容" /></t-form-item>
      <t-form-item label="数字"><t-input-number class="ro-number" [defaultValue]="3" /></t-form-item>
      <t-form-item label="区间"><t-range-input class="ro-range" [value]="range()" (valueChange)="range.set($event)" clearable /></t-form-item>
      <t-form-item label="标签"><t-tag-input class="ro-tags" [defaultValue]="['a', 'b']" clearable dragSort /></t-form-item>
      <t-form-item label="复选"><t-checkbox class="ro-checkbox" defaultChecked>单项</t-checkbox></t-form-item>
      <t-form-item label="复选组"><t-checkbox-group class="ro-checkbox-group" [defaultValue]="['a']" [options]="['a', 'b']" /></t-form-item>
      <t-form-item label="单选"><t-radio class="ro-radio" defaultChecked allowUncheck>可取消</t-radio></t-form-item>
      <t-form-item label="单选组"><t-radio-group class="ro-radio-group" defaultValue="a" [options]="['a', 'b']" /></t-form-item>
      <t-form-item label="选择器"><t-select class="ro-select" [options]="['a', 'b']" value="a" allowInput clearable /></t-form-item>
      <t-form-item label="选择输入">
        <t-select-input class="ro-select-input" multiple allowInput clearable [value]="selected()" [panel]="panel" [popupVisible]="popupVisible()" (valueChange)="selected.set($event)" />
        <ng-template #panel><div style="padding: 12px">自定义面板内容</div></ng-template>
      </t-form-item>
      <t-form-item label="自动补全"><t-auto-complete class="ro-auto" [options]="['a', 'b']" defaultValue="a" clearable /></t-form-item>
      <t-form-item label="日期区间"><t-date-range-picker class="ro-dates" [value]="dates()" (change)="dates.set($event.value)" allowInput clearable /></t-form-item>
      @if (extra()) { <t-form-item label="动态输入"><t-input class="ro-dynamic" defaultValue="动态内容" /></t-form-item> }
      <t-form-item label="开关（独立行为）"><t-switch class="ro-switch" /></t-form-item>
    </t-form>
    <t-input class="ro-outside" defaultValue="表单外可编辑" />
    <p class="demo-hint">只读不禁用 Angular Control，值继续参与表单；显式只读不会被表单 false 解锁。只读继承最近的 TForm，投影与弹层保留原组件上下文；范围包括已有 readonly 能力的输入、勾选和选择类控件。Switch 等没有 readonly 语义的控件保持独立行为，自定义原生输入和第三方 CVA 请自行传只读。</p>
  `,
})
export class DemoFormReadonly {
  readonly readonly = signal(true);
  readonly extra = signal(false);
  readonly popupVisible = signal<boolean | undefined>(undefined);
  readonly text = new FormControl('表单文本', { nonNullable: true });
  readonly range = signal<RangeInputValue>(['1', '2']);
  readonly selected = signal<SelectInputValue>(['a', 'b']);
  readonly dates = signal<DateRangeValue>(['2026-11-01', '2026-11-10']);
}
