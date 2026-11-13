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
  selector: 'demo-form-validator',
  imports: [FormsModule, TFormModule, TInputModule, TButtonModule],
  template: `
    <t-form [rules]="rules" [submitWithWarningMessage]="true" (submit)="handleSubmit($event)">
      <t-form-item label="用户名" name="username">
        <t-input name="username" [(ngModel)]="model.username" placeholder="输入 admin 会得到 warning 级提示" />
      </t-form-item>
      <t-form-item label="密码" name="password">
        <t-input name="password" type="password" [(ngModel)]="model.password" placeholder="至少 6 位" />
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
export class DemoFormValidator {
  protected model = { username: '', password: '' };

  protected readonly rules: FormRules = {
    username: [
      {
        required: true,
        message: '用户名不能为空',
      },
      {
        validator: (value: unknown) => {
          if (String(value).toLowerCase() === 'admin') {
            return { result: false, message: '不建议使用 admin 作为用户名', type: 'warning' };
          }
          return { result: true };
        },
      },
    ],
    password: [{ required: true, message: '密码不能为空' }, { min: 6, message: '密码至少 6 位' }],
  };

  protected result = '';

  protected handleSubmit(payload: FormSubmitResult): void {
    const warnings = Object.values(payload.validateResult).filter((item) => !item.result).length;
    this.result = warnings
      ? `存在 ${warnings} 条 warning 提示，已按 submitWithWarningMessage 放行`
      : `校验通过：${JSON.stringify(payload.fields)}`;
  }
}
