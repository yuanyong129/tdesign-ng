import { Component, signal } from '@angular/core';
import { TTabPanel, TTabs, type TabValue, type TabsDragSortEvent } from '@tdesign-ng/components';

interface TabItem {
  value: TabValue;
  label: string;
}

@Component({
  selector: 'demo-tabs-drag-sort',
  imports: [TTabs, TTabPanel],
  template: `
    <t-tabs
      [dragSort]="true"
      [value]="active()"
      (change)="active.set($event)"
      (dragSortChange)="handleDragSort($event)"
    >
      @for (tab of tabs(); track tab.value) {
        <t-tab-panel [value]="tab.value" [label]="tab.label">
          <div class="demo-tabs-panel">{{ tab.label }} 的内容；拖拽页签可调整顺序。</div>
        </t-tab-panel>
      }
    </t-tabs>
    <p class="demo-hint">当前顺序：{{ order() }}；(dragSortChange) 只抛出位置，需要自己重排面板数据。</p>
  `,
})
export class DemoTabsDragSort {
  protected readonly active = signal<TabValue>('a');

  protected readonly tabs = signal<TabItem[]>([
    { value: 'a', label: '选项卡 A' },
    { value: 'b', label: '选项卡 B' },
    { value: 'c', label: '选项卡 C' },
    { value: 'd', label: '选项卡 D' },
  ]);

  protected readonly order = signal('A → B → C → D');

  protected handleDragSort(event: TabsDragSortEvent): void {
    const list = [...this.tabs()];
    const [moved] = list.splice(event.currentIndex, 1);
    list.splice(event.targetIndex, 0, moved);
    this.tabs.set(list);
    this.order.set(list.map((tab) => String(tab.value).toUpperCase()).join(' → '));
  }
}
