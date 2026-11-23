import { Component, signal } from '@angular/core';
import { TButtonModule, TDropdownModule } from '@tdesign-ng/components';
import type { DropdownClickEvent, DropdownOption } from '@tdesign-ng/components';

@Component({
  selector: 'demo-dropdown-base',
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
      <t-dropdown [options]="options" (click)="handleClick($event)">
        <span><t-button variant="outline">更多操作</t-button></span>
      </t-dropdown>
      <span class="demo-hint">点击项：{{ selected() }}</span>
    </div>
  `,
})
export class DemoDropdownBase {
  protected readonly options: DropdownOption[] = [
    { content: '选项一', value: '1' },
    { content: '选项二', value: '2' },
    {
      content: '更多选项',
      value: 'more',
      children: [
        { content: '子选项一', value: '3-1' },
        { content: '子选项二', value: '3-2' },
      ],
    },
  ];

  protected readonly selected = signal('暂无');

  protected handleClick(event: DropdownClickEvent): void {
    this.selected.set(String(event.item.value));
  }
}
