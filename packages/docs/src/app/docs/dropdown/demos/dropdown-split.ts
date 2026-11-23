import { Component, signal } from '@angular/core';
import { TButtonModule, TDropdownModule } from '@tdesign-ng/components';
import type { DropdownClickEvent, DropdownOption } from '@tdesign-ng/components';

@Component({
  selector: 'demo-dropdown-split',
  imports: [TDropdownModule, TButtonModule],
  styles: [
    `
      .demo-row {
        display: flex;
        align-items: center;
        gap: 12px;
      }
    `,
  ],
  template: `
    <div class="demo-row">
      <t-button theme="primary">主要操作</t-button>
      <t-dropdown [options]="options" [maxColumnWidth]="120" [placement]="'bottom-right'" (click)="handleClick($event)">
        <span><t-button theme="primary">更多</t-button></span>
      </t-dropdown>
      <span class="demo-hint">点击项：{{ selected() }}</span>
    </div>
  `,
})
export class DemoDropdownSplit {
  protected readonly options: DropdownOption[] = [
    { content: '复制链接', value: 'copy' },
    { content: '生成快照', value: 'snapshot' },
    { content: '导出数据', value: 'export' },
  ];

  protected readonly selected = signal('暂无');

  protected handleClick(event: DropdownClickEvent): void {
    this.selected.set(String(event.item.value));
  }
}
