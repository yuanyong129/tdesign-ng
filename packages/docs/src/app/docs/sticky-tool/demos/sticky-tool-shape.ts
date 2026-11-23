import { Component, TemplateRef, computed, viewChild } from '@angular/core';
import { TIcon } from '@tdesign-ng/icons';
import { TStickyToolModule } from '@tdesign-ng/components';
import type { StickyToolItem } from '@tdesign-ng/components';

@Component({
  selector: 'demo-sticky-tool-shape',
  imports: [TStickyToolModule, TIcon],
  styles: [
    '.tool-stage { position: relative; height: 240px; transform: translateZ(0); border: 1px dashed var(--td-component-border); border-radius: 6px; }',
  ],
  template: `
    <div class="tool-stage">
      <t-sticky-tool [list]="items()" placement="right-center" shape="round" type="compact" [width]="72" />
    </div>

    <ng-template #userIcon><t-icon name="user" /></ng-template>
    <ng-template #settingIcon><t-icon name="setting" /></ng-template>
    <ng-template #helpIcon><t-icon name="help-circle" /></ng-template>
  `,
})
export class DemoStickyToolShape {
  private readonly userIcon = viewChild<TemplateRef<unknown>>('userIcon');
  private readonly settingIcon = viewChild<TemplateRef<unknown>>('settingIcon');
  private readonly helpIcon = viewChild<TemplateRef<unknown>>('helpIcon');

  protected readonly items = computed<StickyToolItem[]>(() => [
    { icon: this.userIcon(), label: '个人中心', popup: '个人中心' },
    { icon: this.settingIcon(), label: '设置', popup: '设置' },
    { icon: this.helpIcon(), label: '帮助', popup: '帮助' },
  ]);
}
