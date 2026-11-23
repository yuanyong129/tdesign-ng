import { Component, signal } from '@angular/core';
import { TButtonModule, TSpaceModule, TStepsModule } from '@tdesign-ng/components';
import type { StepValue } from '@tdesign-ng/components';

@Component({
  selector: 'demo-steps-base',
  imports: [TStepsModule, TButtonModule, TSpaceModule],
  template: `
    <t-space direction="vertical" [size]="24">
      <t-steps [current]="current()" (currentChange)="current.set($event)">
        <t-step-item title="已付款" content="订单已支付成功" />
        <t-step-item title="处理中" content="商家正在处理订单" />
        <t-step-item title="已发货" content="包裹已交付物流" />
        <t-step-item title="已完成" content="确认收货后订单完成" />
      </t-steps>

      <t-space>
        <t-button variant="outline" [disabled]="current() === 0" (click)="step(-1)">上一步</t-button>
        <t-button theme="primary" [disabled]="current() === 3" (click)="step(1)">下一步</t-button>
      </t-space>
    </t-space>
  `,
})
export class DemoStepsBase {
  protected readonly current = signal<StepValue>(1);

  protected step(offset: number): void {
    this.current.update((value) => Math.min(3, Math.max(0, Number(value) + offset)));
  }
}
