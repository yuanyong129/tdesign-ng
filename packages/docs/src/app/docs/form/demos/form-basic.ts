import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TButtonModule, TFormModule, TInputModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-form-basic',
  imports: [FormsModule, TFormModule, TInputModule, TButtonModule],
  template: `
    <t-form (submit)="handleSubmit($event)">
      <t-form-item label="姓名" name="name">
        <t-input name="name" [(ngModel)]="model.name" placeholder="请输入姓名" />
      </t-form-item>
      <t-form-item label="邮箱" name="email" help="用于接收通知">
        <t-input name="email" [(ngModel)]="model.email" placeholder="name@example.com" />
      </t-form-item>
      <t-form-item>
        <t-button theme="primary" type="submit">提交</t-button>
      </t-form-item>
    </t-form>
    @if (submitted) {
      <p class="demo-hint">已提交：{{ submitted }}</p>
    }
  `,
})
export class DemoFormBasic {
  protected model = { name: '', email: '' };
  protected submitted = '';

  protected handleSubmit(result: { fields: Record<string, unknown> }): void {
    this.submitted = JSON.stringify(result.fields);
  }
}
