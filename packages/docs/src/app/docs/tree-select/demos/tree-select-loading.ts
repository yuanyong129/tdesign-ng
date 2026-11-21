import { Component, signal } from '@angular/core';
import { TButton, TTreeSelect } from '@tdesign-ng/components';
import type { TreeSelectData } from '@tdesign-ng/components';

@Component({
  selector: 'demo-tree-select-loading',
  imports: [TTreeSelect, TButton],
  template: `
    <div class="demo-tree-select-row" style="max-width: 360px">
      <p class="demo-hint">
        受控 loading：{{ loading() ? '面板显示加载文案' : '面板显示树' }}
        <t-button size="small" variant="outline" (click)="loading.set(!loading())">切换</t-button>
      </p>
      <t-tree-select [data]="data" [loading]="loading()" loadingText="正在加载组织架构…" />
    </div>
  `,
})
export class DemoTreeSelectLoading {
  protected readonly loading = signal(true);

  protected readonly data: TreeSelectData[] = [
    {
      label: '技术部',
      value: 'tech',
      children: [
        { label: '前端', value: 'fe' },
        { label: '后端', value: 'be' },
      ],
    },
    {
      label: '产品部',
      value: 'product',
      children: [{ label: '产品一组', value: 'p1' }],
    },
  ];
}
