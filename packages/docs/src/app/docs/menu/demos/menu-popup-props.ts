import { Component, signal } from '@angular/core';
import { TMenuModule } from '@tdesign-ng/components';
import type { MenuValue } from '@tdesign-ng/components';

@Component({
  selector: 'demo-menu-popup-props',
  imports: [TMenuModule],
  template: `
    <t-menu mode="horizontal" theme="dark" [(value)]="selected">
      <t-submenu title="配置弹层" value="options" [popupProps]="{ trigger: 'click', delay: 0,
        showArrow: true, destroyOnClose: true, placement: 'top', zIndex: 2200,
        overlayClassName: 'menu-custom-panel', overlayInnerClassName: 'menu-custom-inner' }">
        <t-menu-item value="first">第一个选项</t-menu-item>
        <t-menu-item value="second">第二个选项</t-menu-item>
      </t-submenu>
      <t-submenu title="禁用子菜单" value="disabled" disabled [popupProps]="{ disabled: false }">
        <t-menu-item value="unreachable">不可选择</t-menu-item>
      </t-submenu>
    </t-menu>
    <p>当前选中：{{ selected() || '无' }}。浮层位置仍由菜单方向决定，原有主题类与自定义类同时保留。</p>
    <t-menu>
      <t-submenu title="内联模式" value="inline" [popupProps]="{ disabled: true }">
        <t-menu-item value="inline-child">内联内容不受弹层配置影响</t-menu-item>
      </t-submenu>
    </t-menu>
  `,
})
export class DemoMenuPopupProps {
  readonly selected = signal<MenuValue | undefined>(undefined);
}
