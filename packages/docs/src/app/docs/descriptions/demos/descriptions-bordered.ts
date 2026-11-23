import { Component } from '@angular/core';
import type { DescriptionItem } from '@tdesign-ng/components';
import { TDescriptionsModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-descriptions-bordered',
  imports: [TDescriptionsModule],
  template: `
    <t-descriptions
      title="订单信息"
      bordered
      size="small"
      tableLayout="auto"
      [column]="3"
      [colon]="false"
      [items]="items"
      [labelStyle]="{ width: '120px' }"
      [contentStyle]="{ fontWeight: 600 }"
    />
  `,
})
export class DemoDescriptionsBordered {
  protected readonly items: DescriptionItem[] = [
    { label: '订单号', content: '202401010001' },
    { label: '下单时间', content: '2024-01-01 12:00:00' },
    { label: '支付方式', content: '微信支付' },
    { label: '收货人', content: '张三' },
    { label: '收货地址', content: '浙江省杭州市西湖区文三路 100 号', span: 2 },
  ];
}
