import { Component } from '@angular/core';
import { TSelectInputModule, TSpaceModule } from '@tdesign-ng/components';
import type { SelectInputEnterEvent, SelectInputInputChangeEvent, SelectInputValue } from '@tdesign-ng/components';

@Component({
  selector: 'demo-select-input-basic',
  imports: [TSelectInputModule, TSpaceModule],
  template: `
    <t-space direction="vertical" [size]="16" style="width: 360px">
      <t-select-input
        [value]="value"
        [inputValue]="inputValue"
        [allowInput]="true"
        [clearable]="true"
        placeholder="请输入城市名"
        (valueChange)="handleValueChange($event)"
        (inputChange)="handleInputChange($event)"
        (enter)="handleEnter($event)"
      />
      <div style="padding-bottom: 20px">
        <t-select-input
          label="城市"
          [value]="value"
          [allowInput]="true"
          [clearable]="true"
          placeholder="请输入"
          tips="输入后按回车确认，清空按钮只清输入框文本"
          (valueChange)="handleValueChange($event)"
        />
      </div>
      <p class="demo-select-input__state">value：{{ valueText }}；inputValue：{{ inputValue }}</p>
    </t-space>
  `,
  styles: [
    `
      .demo-select-input__state {
        margin: 0;
        color: var(--td-text-color-secondary);
        font-size: 13px;
      }
    `,
  ],
})
export class DemoSelectInputBasic {
  protected value: SelectInputValue = '深圳市';

  protected inputValue = '深圳市';

  protected get valueText(): string {
    const value = this.value;
    return value === undefined || value === null || value === '' ? '（空）' : String(value);
  }

  protected handleValueChange(value: SelectInputValue): void {
    this.value = value;
  }

  protected handleInputChange(event: SelectInputInputChangeEvent): void {
    this.inputValue = event.value;
  }

  protected handleEnter(event: SelectInputEnterEvent): void {
    this.value = event.inputValue;
  }
}
