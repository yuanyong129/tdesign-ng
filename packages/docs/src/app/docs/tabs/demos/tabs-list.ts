import { Component, computed, signal, viewChild, type TemplateRef } from '@angular/core';
import { TButton, TTabPanel, TTabs, type TabsListItem, type TabsDragSortEvent, type TabsRemoveEvent, type TabValue, type TabsPlacement, type TabsTheme } from '@tdesign-ng/components';

let counterId = 0;

@Component({
  selector: 'demo-tabs-list-counter',
  imports: [TButton],
  template: `<div class="demo-tabs-panel">实例 {{ instance }}；计数 {{ count() }} <t-button size="small" (click)="count.update(increment)">增加计数</t-button></div>`,
})
export class DemoTabsListCounter {
  readonly instance = ++counterId;
  readonly count = signal(0);
  readonly increment = (value: number) => value + 1;
}

@Component({
  selector: 'demo-tabs-list',
  imports: [TTabs, TTabPanel, TButton, DemoTabsListCounter],
  template: `
    <ng-template #label><span class="data-label">{{ labelText() }}</span></ng-template>
    <ng-template #keep><demo-tabs-list-counter class="data-keep" /></ng-template>
    <ng-template #lazy><demo-tabs-list-counter class="data-lazy" /></ng-template>
    <ng-template #destroy><demo-tabs-list-counter class="data-destroy" /></ng-template>
    <ng-template #actions><t-button size="small" (click)="reverse()">倒序</t-button></ng-template>
    <t-tabs class="list-controlled" [list]="list()" [value]="value()" [disabled]="disabled()" [placement]="placement()" [theme]="theme()"
      addable dragSort [action]="actions" (change)="accept($event)" (remove)="remove($event)" (add)="add()" (dragSortChange)="sort($event)">
      <t-tab-panel value="fallback" label="投影回退"><div class="demo-tabs-panel data-fallback">list 为空时显示投影面板</div></t-tab-panel>
    </t-tabs>
    <p class="demo-hint">当前值 {{ value() }}；切换 {{ changes() }} 次，关闭 {{ removes() }} 次，新增 {{ adds() }} 次，排序 {{ sorts() }} 次。</p>
    <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:24px">
      <t-button size="small" (click)="acceptChanges.set(!acceptChanges())">{{ acceptChanges() ? '拒绝切换提案' : '接收切换提案' }}</t-button>
      <t-button size="small" (click)="disabled.set(!disabled())">切换禁用</t-button>
      <t-button size="small" (click)="placement.set(placement() === 'left' ? 'top' : 'left')">切换方向</t-button>
      <t-button size="small" (click)="theme.set(theme() === 'normal' ? 'card' : 'normal')">切换主题</t-button>
      <t-button size="small" (click)="labelText.set(labelText() === '保留状态' ? '标题已更新' : '保留状态')">更新模板标题</t-button>
      <t-button size="small" (click)="items.set([]); value.set('fallback')">清空并显示投影</t-button>
      <t-button size="small" (click)="restore()">恢复数据</t-button>
    </div>
    <t-tabs class="list-default" [defaultValue]="initial()" [list]="defaultItems" />
  `,
})
export class DemoTabsList {
  private readonly keep = viewChild<TemplateRef<unknown>>('keep');
  private readonly lazy = viewChild<TemplateRef<unknown>>('lazy');
  private readonly destroy = viewChild<TemplateRef<unknown>>('destroy');
  private readonly label = viewChild<TemplateRef<unknown>>('label');
  readonly items = signal<TabsListItem[]>(this.seed());
  readonly list = computed(() => this.items().map((item) => ({ ...item,
    ...(item.value === 'keep' ? { label: this.label(), panel: this.keep() } : {}),
    ...(item.value === 'lazy' ? { panel: this.lazy() } : {}),
    ...(item.value === 'destroy' ? { panel: this.destroy() } : {}),
  })));
  readonly defaultItems: TabsListItem[] = [{ value: 'first', label: '默认一', panel: '默认内容一' }, { value: 'second', label: '默认二', panel: '默认内容二' }];
  readonly initial = signal<TabValue>('first');
  readonly value = signal<TabValue>('keep');
  readonly acceptChanges = signal(true);
  readonly disabled = signal(false);
  readonly placement = signal<TabsPlacement>('top');
  readonly theme = signal<TabsTheme>('normal');
  readonly labelText = signal('保留状态');
  readonly changes = signal(0);
  readonly removes = signal(0);
  readonly itemRemoves = signal(0);
  readonly adds = signal(0);
  readonly sorts = signal(0);
  readonly lastRemove = signal<{ value: TabValue; index: number } | undefined>(undefined);
  readonly lastSort = signal<TabsDragSortEvent | undefined>(undefined);
  private next = 1;

  accept(value: TabValue): void { this.changes.update((n) => n + 1); if (this.acceptChanges()) this.value.set(value); }
  reverse(): void { this.items.update((items) => [...items].reverse()); }
  restore(): void { this.items.set(this.seed()); this.value.set('keep'); }
  add(): void {
    this.adds.update((n) => n + 1);
    const value = `added-${this.next++}`;
    this.items.update((items) => [...items, { value, label: '新增页签', panel: '由调用方添加', removable: true }]);
    this.value.set(value);
  }
  remove(event: TabsRemoveEvent): void {
    this.removes.update((n) => n + 1); this.lastRemove.set({ value: event.value, index: event.index });
    this.items.update((items) => items.filter((_, index) => index !== event.index));
    if (this.value() === event.value) this.value.set(this.items().find((item) => !item.disabled)?.value ?? '');
  }
  sort(event: TabsDragSortEvent): void {
    this.sorts.update((n) => n + 1); this.lastSort.set(event);
    this.items.update((items) => { const result = [...items]; const [item] = result.splice(event.currentIndex, 1); result.splice(event.targetIndex, 0, item); return result; });
  }
  private seed(): TabsListItem[] {
    return [
      { value: 'keep', label: '保留状态', removable: true, onRemove: () => this.itemRemoves.update((n) => n + 1) },
      { value: 'disabled', label: '禁用页签', disabled: true, panel: '不可通过用户操作激活' },
      { value: 'lazy', label: '首次激活才创建', lazy: true },
      { value: 'destroy', label: '隐藏时销毁', destroyOnHide: true, removable: true },
      { value: 0, label: '数值 0', panel: '数值键' },
      { value: '0', label: '字符串 0', panel: '字符串键' },
    ];
  }
}
