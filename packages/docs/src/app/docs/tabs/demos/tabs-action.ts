import { Component, signal } from '@angular/core';
import { TTabs, TTabPanel, TButton } from '@tdesign-ng/components';

@Component({
  selector: 'demo-tabs-action',
  imports: [TTabs, TTabPanel, TButton],
  template: `
    <ng-template #actions>
      <t-button variant="text" (click)="refreshes.update(increment)">刷新 {{ refreshes() }}</t-button>
    </ng-template>
    <t-tabs defaultValue="first" [action]="actions" addable>
      <t-tab-panel value="first" label="详情">详情内容</t-tab-panel>
      <t-tab-panel value="second" label="记录">记录内容</t-tab-panel>
      @for (number of moreTabs; track number) {
        <t-tab-panel [value]="number" [label]="'选项卡 ' + number">内容 {{ number }}</t-tab-panel>
      }
    </t-tabs>
    <t-tabs defaultValue="first" action="只读说明" placement="bottom" theme="card">
      <t-tab-panel value="first" label="底部导航">字符串操作区</t-tab-panel>
    </t-tabs>
  `,
})
export class DemoTabsAction {
  readonly refreshes = signal(0);
  readonly moreTabs = [3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  readonly increment = (value: number) => value + 1;
}
