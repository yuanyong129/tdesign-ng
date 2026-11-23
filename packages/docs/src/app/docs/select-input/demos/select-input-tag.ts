import { Component } from '@angular/core';
import { TSelectInputModule, TSpaceModule } from '@tdesign-ng/components';
import type { SelectInputTagChangeEvent, SelectInputValue } from '@tdesign-ng/components';

@Component({
  selector: 'demo-select-input-tag',
  imports: [TSelectInputModule, TSpaceModule],
  template: `
    <t-space direction="vertical" [size]="16" style="width: 360px">
      <t-select-input
        [multiple]="true"
        [value]="tags"
        [minCollapsedNum]="2"
        [clearable]="true"
        placeholder="请选择标签"
        (valueChange)="handleValueChange($event)"
        (tagChange)="handleTagChange($event)"
      />
      <t-select-input [multiple]="true" [value]="tags" [readonly]="true" />
      <t-select-input [multiple]="true" [value]="tags" [disabled]="true" />
      <p class="demo-select-input__state">已选 {{ selectedCount }} 个：{{ selectedText }}</p>
      <p class="demo-select-input__state">最近一次 tagChange：{{ lastAction || '（暂无）' }}</p>
    </t-space>
  `,
  styles: [
    `
      .demo-select-input__state {
        margin: 0;
        color: var(--td-text-color-secondary);
        font-size: 13px;
      }
    `,
  ],
})
export class DemoSelectInputTag {
  protected tags: SelectInputValue = ['选项一', '选项二', '选项三', '选项四'];

  protected lastAction = '';

  protected get selectedItems(): SelectInputValue[] {
    return Array.isArray(this.tags) ? this.tags : [];
  }

  protected get selectedCount(): number {
    return this.selectedItems.length;
  }

  protected get selectedText(): string {
    return this.selectedItems.length ? this.selectedItems.join('、') : '（空）';
  }

  protected handleValueChange(value: SelectInputValue): void {
    this.tags = value;
  }

  protected handleTagChange(event: SelectInputTagChangeEvent): void {
    this.lastAction = `${event.trigger}：${event.item ?? ''}`;
  }
}
