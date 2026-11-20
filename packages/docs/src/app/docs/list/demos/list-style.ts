import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TList, TListItem } from '@tdesign-ng/components';

@Component({
  selector: 'demo-list-style',
  standalone: true,
  imports: [TList, TListItem],
  template: `
    <div class="demo-list-style">
      <p class="demo-list-label">split 显示分割线</p>
      <t-list split>
        <t-list-item content="第一行内容" />
        <t-list-item content="第二行内容" />
        <t-list-item content="第三行内容" />
      </t-list>

      <p class="demo-list-label">stripe 斑马纹</p>
      <t-list stripe>
        <t-list-item content="第一行内容" />
        <t-list-item content="第二行内容" />
        <t-list-item content="第三行内容" />
      </t-list>

      <p class="demo-list-label">size = small</p>
      <t-list size="small" split>
        <t-list-item content="紧凑的一行" />
        <t-list-item content="紧凑的两行" />
      </t-list>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemoListStyle {}
