import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TButtonModule, TFormModule, TInputModule, TSpaceModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-form-inline',
  imports: [FormsModule, TFormModule, TInputModule, TButtonModule, TSpaceModule],
  template: `
    <t-form layout="inline">
      <t-form-item label="姓名" name="name">
        <t-input name="name" [(ngModel)]="model.name" placeholder="请输入" />
      </t-form-item>
      <t-form-item label="城市" name="city">
        <t-input name="city" [(ngModel)]="model.city" placeholder="请输入" />
      </t-form-item>
      <t-form-item>
        <t-button theme="primary">查询</t-button>
      </t-form-item>
    </t-form>
    <p class="demo-hint">当前值：{{ model.name || '（空）' }} / {{ model.city || '（空）' }}</p>
  `,
})
export class DemoFormInline {
  protected model = { name: '', city: '' };
}
