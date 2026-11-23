import { Component, signal } from '@angular/core';
import { TButtonModule, TMenuModule, TSpaceModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-menu-collapsed',
  imports: [TMenuModule, TButtonModule, TSpaceModule],
  template: `
    <ng-template #iconHome>
      <svg class="t-icon t-icon-home" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
        <path d="M4 10.6 12 4l8 6.6V20h-5.2v-5.6H9.2V20H4z" stroke-linejoin="round" />
      </svg>
    </ng-template>
    <ng-template #iconFolder>
      <svg class="t-icon t-icon-folder" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
        <path d="M3.5 6.5h6l2 2.4h9v9.6h-17z" stroke-linejoin="round" />
      </svg>
    </ng-template>
    <ng-template #iconSetting>
      <svg class="t-icon t-icon-setting" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
        <circle cx="12" cy="12" r="3.2" />
        <path d="M12 4v2.2M12 17.8V20M4 12h2.2M17.8 12H20M6.3 6.3l1.6 1.6M16.1 16.1l1.6 1.6M17.7 6.3l-1.6 1.6M7.9 16.1l-1.6 1.6" />
      </svg>
    </ng-template>

    <t-space direction="vertical" [size]="16">
      <t-button variant="outline" (click)="menu.toggleCollapsed()">
        {{ collapsed() ? '展开菜单' : '收起菜单' }}
      </t-button>

      <t-menu
        #menu
        [collapsed]="collapsed()"
        (collapsedChange)="collapsed.set($event)"
        defaultValue="dashboard"
        collapsedWidth="64px"
      >
        <t-menu-item value="dashboard" [icon]="iconHome">仪表盘</t-menu-item>
        <t-submenu value="resources" title="资源管理" [icon]="iconFolder">
          <t-menu-item value="resource-list">资源列表</t-menu-item>
          <t-menu-item value="resource-detail">资源详情</t-menu-item>
          <t-submenu value="resource-archive" title="归档资源">
            <t-menu-item value="resource-archive-2023">2023 年</t-menu-item>
            <t-menu-item value="resource-archive-2024">2024 年</t-menu-item>
          </t-submenu>
        </t-submenu>
        <t-menu-item value="settings" [icon]="iconSetting">系统设置</t-menu-item>
      </t-menu>
    </t-space>
  `,
})
export class DemoMenuCollapsed {
  protected readonly collapsed = signal(false);
}
