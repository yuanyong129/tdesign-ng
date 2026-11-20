import { Component } from '@angular/core';
import { TEmpty, type EmptyType } from '@tdesign-ng/components';

@Component({
  selector: 'demo-empty-type',
  imports: [TEmpty],
  template: `
    <div class="demo-empty-grid">
      @for (item of types; track item.type) {
        <t-empty [type]="item.type" size="small" [description]="item.description" />
      }
    </div>
    <p class="demo-hint">type 取 empty / success / fail / network-error / maintenance 时会换上对应的内置插图与标题。</p>
  `,
})
export class DemoEmptyType {
  protected readonly types: Array<{ type: EmptyType; description: string }> = [
    { type: 'empty', description: '当前没有数据' },
    { type: 'success', description: '操作已完成' },
    { type: 'fail', description: '提交失败' },
    { type: 'network-error', description: '网络连接异常' },
    { type: 'maintenance', description: '系统维护中' },
  ];
}
