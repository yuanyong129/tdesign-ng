import { Component, signal } from '@angular/core';
import { TText } from '@tdesign-ng/components';

@Component({
  selector: 'demo-typography-copyable',
  imports: [TText],
  template: `
    <p><t-text [copyable]="true">可复制的默认投影内容</t-text></p>
    <ng-template #suffix let-copied="copied">{{ copied ? '完成' : '复制编号' }}</ng-template>
    <p><t-text content="订单编号" [copyable]="{ text: 'TD-2026', suffix: suffix,
      tooltipProps: { content: '复制完整编号', placement: 'bottom' }, onCopy: record }" /></p>
    <p aria-live="polite">成功复制 {{ copies() }} 次</p>
    <t-text content="禁用时不能复制" disabled [copyable]="true" />
  `,
})
export class DemoTypographyCopyable {
  readonly copies = signal(0);
  readonly record = () => this.copies.update((value) => value + 1);
}
