import { Component, signal } from '@angular/core';
import { TMenuModule } from '@tdesign-ng/components';
import type { MenuValue } from '@tdesign-ng/components';

@Component({
  selector: 'demo-menu-horizontal',
  imports: [TMenuModule],
  template: `
    <ng-template #logo>
      <span>TDesign</span>
    </ng-template>
    <ng-template #operations>
      <span class="t-menu__operations-icon">
        <svg class="t-icon t-icon-notification" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
          <path d="M6 10a6 6 0 1 1 12 0c0 4 1.6 5.5 1.6 5.5H4.4S6 14 6 10z" stroke-linejoin="round" />
          <path d="M10 19a2 2 0 0 0 4 0" />
        </svg>
      </span>
    </ng-template>

    <t-menu
      mode="horizontal"
      [logo]="logo"
      [operations]="operations"
      [value]="selected()"
      (valueChange)="selected.set($event)"
    >
      <t-menu-item value="dashboard">仪表盘</t-menu-item>
      <t-menu-item value="billing">账单</t-menu-item>
      <t-submenu value="resources" title="资源管理">
        <t-menu-item value="resource-list">资源列表</t-menu-item>
        <t-menu-item value="resource-detail">资源详情</t-menu-item>
      </t-submenu>
      <t-menu-item value="settings">系统设置</t-menu-item>
    </t-menu>

    <p class="demo__desc">当前选中：{{ selected() }}</p>
  `,
})
export class DemoMenuHorizontal {
  protected readonly selected = signal<MenuValue | undefined>('dashboard');
}
