import { Component } from '@angular/core';
import { TTagInputModule, type TagInputValue } from '@tdesign-ng/components';

@Component({
  selector: 'demo-tag-input-basic',
  imports: [TTagInputModule],
  template: `
    <t-tag-input
      [(value)]="value"
      [(inputValue)]="inputValue"
      placeholder="输入内容后按回车创建标签"
      [clearable]="true"
    />
    <p class="demo-hint">标签 {{ value.length }} 个，输入框内容「{{ inputValue }}」。</p>
  `,
})
export class DemoTagInputBasic {
  protected value: TagInputValue = ['Vue', 'React'];

  protected inputValue = '';
}
