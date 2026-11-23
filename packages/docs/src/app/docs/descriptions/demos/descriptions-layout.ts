import { Component } from '@angular/core';
import { TDescriptionsModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-descriptions-layout',
  imports: [TDescriptionsModule],
  template: `
    <div style="display: flex; flex-direction: column; gap: 24px">
      <t-descriptions title="横向布局 + 纵向排列" [column]="3" itemLayout="vertical">
        <t-descriptions-item label="姓名">张三</t-descriptions-item>
        <t-descriptions-item label="手机号">138 0000 0000</t-descriptions-item>
        <t-descriptions-item label="邮箱">zhangsan&#64;example.com</t-descriptions-item>
      </t-descriptions>

      <t-descriptions title="纵向布局" layout="vertical">
        <t-descriptions-item label="姓名">张三</t-descriptions-item>
        <t-descriptions-item label="签名">这个人很懒，什么都没有留下。</t-descriptions-item>
      </t-descriptions>

      <t-descriptions title="纵向布局 + 纵向排列" layout="vertical" itemLayout="vertical">
        <t-descriptions-item label="姓名">张三</t-descriptions-item>
        <t-descriptions-item label="签名">这个人很懒，什么都没有留下。</t-descriptions-item>
      </t-descriptions>
    </div>
  `,
})
export class DemoDescriptionsLayout {}
