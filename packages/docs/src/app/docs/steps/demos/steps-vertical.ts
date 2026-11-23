import { Component } from '@angular/core';
import { TStepsModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-steps-vertical',
  imports: [TStepsModule],
  template: `
    <t-steps layout="vertical" [current]="1">
      <t-step-item title="提交申请" content="2024-01-01 10:00" />
      <t-step-item title="审核中" content="审核人：张三" extra="预计 2 个工作日" />
      <t-step-item title="打款失败" content="银行卡信息有误" status="error" />
      <t-step-item title="完成" content="打款成功后自动完成" />
    </t-steps>
  `,
})
export class DemoStepsVertical {}
