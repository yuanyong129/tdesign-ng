import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  TButtonModule,
  TFormModule,
  TInputModule,
  type FormRules,
  type FormSubmitResult,
} from '@tdesign-ng/components';

@Component({
  selector: 'demo-form-rules',
  imports: [FormsModule, TFormModule, TInputModule, TButtonModule],
  template: `
    <t-form [rules]="rules" (submit)="handleSubmit($event)">
      <t-form-item label="账号" name="account">
        <t-input name="account" [(ngModel)]="model.account" placeholder="必填，至少 3 个字符" />
      </t-form-item>
      <t-form-item label="邮箱" name="email">
        <t-input name="email" [(ngModel)]="model.email" placeholder="请输入合法邮箱" />
      </t-form-item>
      <t-form-item label="年龄" name="age">
        <t-input name="age" [(ngModel)]="model.age" placeholder="18 到 60 之间" />
      </t-form-item>
      <t-form-item>
        <t-button theme="primary" type="submit">提交</t-button>
      </t-form-item>
    </t-form>
    @if (result) {
      <p class="demo-hint">{{ result }}</p>
    }
  `,
})
export class DemoFormRules {
  protected model = { account: '', email: '', age: '' };

  protected readonly rules: FormRules = {
    account: [{ required: true, message: '账号不能为空' }, { min: 3, message: '账号至少 3 个字符' }],
    email: [{ required: true, message: '邮箱不能为空' }, { type: 'email', message: '邮箱格式不正确' }],
    age: [
      {
        validator: (value: unknown) => {
          const age = Number(value);
          if (value === '' || value === undefined || Number.isNaN(age)) return { result: true };
          return age >= 18 && age <= 60
            ? { result: true }
            : { result: false, message: '年龄需在 18 到 60 之间' };
        },
      },
    ],
  };

  protected result = '';

  protected handleSubmit(payload: FormSubmitResult): void {
    this.result = `校验通过，提交数据：${JSON.stringify(payload.fields)}`;
  }
}
