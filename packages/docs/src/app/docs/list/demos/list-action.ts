import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TList, TListItem } from '@tdesign-ng/components';

@Component({
  selector: 'demo-list-action',
  standalone: true,
  imports: [TList, TListItem],
  template: `
    <div class="demo-list-action">
      <p class="demo-list-label">horizontal（默认）：操作区在内容右侧</p>
      <t-list split>
        <t-list-item content="内容一" action="编辑 / 删除" />
        <t-list-item content="内容二" action="编辑 / 删除" />
      </t-list>

      <p class="demo-list-label">layout = vertical：操作区另起一行</p>
      <t-list layout="vertical" split>
        <t-list-item content="内容一" action="编辑 / 删除" />
        <t-list-item content="内容二" action="编辑 / 删除" />
      </t-list>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemoListAction {}
