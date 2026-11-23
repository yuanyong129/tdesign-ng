import { Component, signal } from '@angular/core';
import { TMenuModule, TSpaceModule } from '@tdesign-ng/components';
import type { MenuValue } from '@tdesign-ng/components';

@Component({
  selector: 'demo-menu-base',
  imports: [TMenuModule, TSpaceModule],
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

    <t-space direction="vertical" [size]="16">
      <t-menu
        [value]="selected()"
        (valueChange)="selected.set($event)"
        [expanded]="expanded()"
        (expandedChange)="expanded.set($event)"
      >
        <t-menu-item value="dashboard" [icon]="iconHome">仪表盘</t-menu-item>
        <t-menu-item value="billing" disabled>账单（禁用）</t-menu-item>
        <t-submenu value="resources" title="资源管理" [icon]="iconFolder">
          <t-menu-item value="resource-list">资源列表</t-menu-item>
          <t-menu-item value="resource-detail">资源详情</t-menu-item>
        </t-submenu>
        <t-menu-group title="偏好">
          <t-menu-item value="settings">系统设置</t-menu-item>
        </t-menu-group>
      </t-menu>

      <p class="demo__desc">
        当前选中：{{ selected() }}，展开：{{ expanded().join('、') || '无' }}
      </p>
    </t-space>
  `,
})
export class DemoMenuBase {
  protected readonly selected = signal<MenuValue | undefined>('dashboard');
  protected readonly expanded = signal<MenuValue[]>(['resources']);
}
