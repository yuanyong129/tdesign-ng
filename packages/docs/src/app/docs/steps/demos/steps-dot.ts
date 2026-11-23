import { Component } from '@angular/core';
import { TStepsModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-steps-dot',
  imports: [TStepsModule],
  template: `
    <t-steps theme="dot" separator="dashed" [current]="2" [readonly]="true">
      <t-step-item title="创建订单" content="下单并锁定库存" />
      <t-step-item title="支付订单" content="在线支付成功" />
      <t-step-item title="仓库发货" content="正在打包出库" />
      <t-step-item title="交易完成" content="确认收货后完成" />
    </t-steps>
  `,
})
export class DemoStepsDot {}
