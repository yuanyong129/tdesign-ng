import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TFormModule, TInputModule, TSpaceModule, TSwitchModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-form-disabled',
  imports: [FormsModule, TFormModule, TInputModule, TSwitchModule, TSpaceModule],
  template: `
    <t-space direction="vertical" [size]="16">
      <p class="demo-hint">
        整体禁用：
        <t-switch [(value)]="disabled" />
      </p>
      <t-form [disabled]="disabled">
        <t-form-item label="姓名" name="name">
          <t-input name="name" [(ngModel)]="model.name" placeholder="整表禁用时不可编辑" />
        </t-form-item>
        <t-form-item label="部门" name="dept" help="关闭上面的开关后可以正常编辑">
          <t-input name="dept" [(ngModel)]="model.dept" placeholder="请输入" />
        </t-form-item>
      </t-form>
    </t-space>
  `,
})
export class DemoFormDisabled {
  protected disabled = true;
  protected model = { name: '', dept: '' };
}
