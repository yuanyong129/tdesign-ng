import { Component } from '@angular/core';
import { TButton, TEmpty, TEmptyAction } from '@tdesign-ng/components';

@Component({
  selector: 'demo-empty-basic',
  imports: [TEmpty, TEmptyAction, TButton],
  template: `
    <t-empty description="没有匹配的数据，试试调整筛选条件。">
      <t-button tEmptyAction theme="primary" variant="outline">重新加载</t-button>
    </t-empty>
    <p class="demo-hint">type 默认是 empty，不传 title 时使用内置文案「暂无数据」。</p>
  `,
})
export class DemoEmptyBasic {}
