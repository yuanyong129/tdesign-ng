import { Component } from '@angular/core';
import { TDescriptionsModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-descriptions-base',
  imports: [TDescriptionsModule],
  template: `
    <t-descriptions title="用户信息">
      <t-descriptions-item label="姓名">张三</t-descriptions-item>
      <t-descriptions-item label="手机号">138 0000 0000</t-descriptions-item>
      <t-descriptions-item label="邮箱">zhangsan&#64;example.com</t-descriptions-item>
      <t-descriptions-item label="部门">设计部</t-descriptions-item>
      <t-descriptions-item label="备注" [span]="2">
        这里是一段跨两列的说明文字，用来展示 span 的用法。
      </t-descriptions-item>
    </t-descriptions>
  `,
})
export class DemoDescriptionsBase {}
