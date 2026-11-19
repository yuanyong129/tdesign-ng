import { Component, signal } from '@angular/core';
import { TTabPanel, TTabs, type TabValue, type TabsAddEvent, type TabsRemoveEvent } from '@tdesign-ng/components';

interface TabItem {
  value: TabValue;
  label: string;
}

@Component({
  selector: 'demo-tabs-add-remove',
  imports: [TTabs, TTabPanel],
  template: `
    <t-tabs
      [addable]="true"
      [value]="active()"
      (change)="active.set($event)"
      (add)="handleAdd($event)"
      (remove)="handleRemove($event)"
    >
      @for (tab of tabs(); track tab.value) {
        <t-tab-panel [value]="tab.value" [label]="tab.label" [removable]="true">
          <div class="demo-tabs-panel">{{ tab.label }} 的内容</div>
        </t-tab-panel>
      }
    </t-tabs>
    <p class="demo-hint">共 {{ tabs().length }} 个页签：点右侧「+」新增、点页签上的「×」关闭。</p>
  `,
})
export class DemoTabsAddRemove {
  protected readonly active = signal<TabValue>(1);

  protected readonly tabs = signal<TabItem[]>([
    { value: 1, label: '选项卡一' },
    { value: 2, label: '选项卡二' },
  ]);

  private nextId = 3;

  protected handleAdd(event: TabsAddEvent): void {
    void event;
    const value = this.nextId++;
    this.tabs.update((list) => [...list, { value, label: `选项卡${value}` }]);
    this.active.set(value);
  }

  protected handleRemove(event: TabsRemoveEvent): void {
    this.tabs.update((list) => list.filter((tab) => tab.value !== event.value));
    if (this.active() === event.value) {
      this.active.set(this.tabs()[0]?.value ?? '');
    }
  }
}
