import { Component, TemplateRef, computed, viewChild } from '@angular/core';
import { TIcon } from '@tdesign-ng/icons';
import { TStickyToolModule } from '@tdesign-ng/components';
import type { StickyToolItem } from '@tdesign-ng/components';

@Component({
  selector: 'demo-sticky-tool-placement',
  imports: [TStickyToolModule, TIcon],
  styles: [
    '.tool-stage { position: relative; height: 240px; transform: translateZ(0); border: 1px dashed var(--td-component-border); border-radius: 6px; }',
  ],
  template: `
    <div class="tool-stage">
      <t-sticky-tool [list]="items()" placement="left-top" [offset]="[0, 16]" />
    </div>

    <ng-template #notificationIcon><t-icon name="notification" /></ng-template>
    <ng-template #linkIcon><t-icon name="link" /></ng-template>
  `,
})
export class DemoStickyToolPlacement {
  private readonly notificationIcon = viewChild<TemplateRef<unknown>>('notificationIcon');
  private readonly linkIcon = viewChild<TemplateRef<unknown>>('linkIcon');

  protected readonly items = computed<StickyToolItem[]>(() => [
    // 没有 popup 的子项不会包弹层，点击/悬浮只派发事件。
    { icon: this.notificationIcon(), label: '通知' },
    { icon: this.linkIcon(), label: '链接', popup: '弹层可以放任意内容' },
  ]);
}
