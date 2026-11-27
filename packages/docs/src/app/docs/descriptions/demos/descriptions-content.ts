import { Component, signal } from '@angular/core';
import { TDescriptions, TDescriptionItem, TButton } from '@tdesign-ng/components';

@Component({
  selector: 'demo-descriptions-content',
  imports: [TDescriptions, TDescriptionItem, TButton],
  template: `
    <t-descriptions bordered [column]="1">
      <t-descriptions-item label="动态富内容">
        <strong>{{ count() }}</strong>
        <t-button variant="text" (click)="increment()">增加</t-button>
      </t-descriptions-item>
      <t-descriptions-item label="显式内容优先" content="显示此内容">不显示的投影</t-descriptions-item>
      <t-descriptions-item label="纯文本">默认投影也支持纯文本</t-descriptions-item>
    </t-descriptions>
  `,
})
export class DemoDescriptionsContent {
  readonly count = signal(0);
  increment(): void { this.count.update((value) => value + 1); }
}
