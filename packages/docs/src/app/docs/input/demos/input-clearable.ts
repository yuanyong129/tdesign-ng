import { Component } from '@angular/core';
import { TInputModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-input-clearable',
  imports: [TInputModule],
  template: `
    <t-input placeholder="输入后出现清空图标" [(value)]="value" [clearable]="true" />
    <p class="demo-hint">当前值：{{ value || '（空）' }}</p>
  `,
})
export class DemoInputClearable {
  protected value = '可清空的内容';
}
