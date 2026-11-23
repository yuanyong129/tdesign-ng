import { Component, TemplateRef, computed, viewChild } from '@angular/core';
import { TIcon } from '@tdesign-ng/icons';
import { TStickyToolModule } from '@tdesign-ng/components';
import type { StickyToolItem } from '@tdesign-ng/components';

/**
 * StickyTool 是 `position: fixed` 的浮层，直接用会飘在视口边缘。
 * 这里用 `transform: translateZ(0)` 建包含块，把浮层收进示例舞台。
 */
@Component({
  selector: 'demo-sticky-tool-base',
  imports: [TStickyToolModule, TIcon],
  styles: [
    '.tool-stage { position: relative; height: 240px; transform: translateZ(0); border: 1px dashed var(--td-component-border); border-radius: 6px; }',
  ],
  template: `
    <div class="tool-stage">
      <t-sticky-tool [list]="items()" placement="right-bottom" />
    </div>

    <ng-template #userIcon><t-icon name="user" /></ng-template>
    <ng-template #cartIcon><t-icon name="cart" /></ng-template>
    <ng-template #mailIcon><t-icon name="mail" /></ng-template>
  `,
})
export class DemoStickyToolBase {
  private readonly userIcon = viewChild<TemplateRef<unknown>>('userIcon');
  private readonly cartIcon = viewChild<TemplateRef<unknown>>('cartIcon');
  private readonly mailIcon = viewChild<TemplateRef<unknown>>('mailIcon');

  protected readonly items = computed<StickyToolItem[]>(() => [
    { icon: this.userIcon(), label: '个人中心', popup: '个人中心：查看账号信息' },
    { icon: this.cartIcon(), label: '购物车', popup: '购物车：2 件商品', trigger: 'click' },
    { icon: this.mailIcon(), label: '消息' },
  ]);
}
