import { Component, signal } from '@angular/core';
import { TButtonModule } from '@tdesign-ng/components';
import { TAffixModule } from '@tdesign-ng/components';
import type { AffixFixedChangeEvent } from '@tdesign-ng/components';

@Component({
  selector: 'demo-affix-fixed-change',
  imports: [TAffixModule, TButtonModule],
  template: `
    <div #box style="height: 200px; overflow-y: auto">
      <div style="height: 40px"></div>
      <t-affix [container]="box" [offsetTop]="8" (fixedChange)="handleFixedChange($event)">
        <t-button>固钉</t-button>
      </t-affix>
      <div style="height: 400px; padding-top: 16px">滚动查看 fixedChange 的输出。</div>
    </div>
    <p class="demo-hint">固定状态：{{ affixed() ? '已吸附' : '未吸附' }}，top = {{ top() }}px。</p>
  `,
})
export class DemoAffixFixedChange {
  protected readonly affixed = signal(false);
  protected readonly top = signal(0);

  protected handleFixedChange(event: AffixFixedChangeEvent): void {
    this.affixed.set(event.affixed);
    this.top.set(Number.isNaN(event.top) ? 0 : Math.round(event.top));
  }
}
