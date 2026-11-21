import { Component, computed, signal } from '@angular/core';
import { TTreeSelect, TTreeSelectPanelBottom, TTreeSelectPanelTop } from '@tdesign-ng/components';
import type { TreeSelectData, TreeSelectValue } from '@tdesign-ng/components';

@Component({
  selector: 'demo-tree-select-panel',
  imports: [TTreeSelect, TTreeSelectPanelTop, TTreeSelectPanelBottom],
  template: `
    <div class="demo-tree-select-row" style="max-width: 380px">
      <t-tree-select [data]="data" [value]="value()" (change)="value.set($event.value)">
        <ng-template tTreeSelectPanelTop>
          <div style="padding: 4px 8px 8px; color: #888; border-bottom: 1px solid #e7e7e7">
            面板顶部：组织架构
          </div>
        </ng-template>
        <ng-template tTreeSelectPanelBottom>
          <div style="padding: 8px 8px 4px; color: #888; border-top: 1px solid #e7e7e7">
            面板底部：共 {{ count() }} 个节点
          </div>
        </ng-template>
      </t-tree-select>
      <p class="demo-hint">用 tTreeSelectPanelTop / tTreeSelectPanelBottom 往面板上下插入内容；当前选中：{{ value() ?? '（空）' }}。</p>
    </div>
  `,
})
export class DemoTreeSelectPanel {
  protected readonly value = signal<TreeSelectValue | undefined>(undefined);

  protected readonly data: TreeSelectData[] = [
    {
      label: '产品部',
      value: 'product',
      children: [
        { label: '产品一组', value: 'p1' },
        { label: '产品二组', value: 'p2' },
      ],
    },
    {
      label: '技术部',
      value: 'tech',
      children: [
        {
          label: '前端',
          value: 'fe',
          children: [
            { label: '架构组', value: 'fe-arch' },
            { label: '业务组', value: 'fe-biz' },
          ],
        },
        { label: '后端', value: 'be' },
      ],
    },
  ];

  protected readonly count = computed(() => {
    let total = 0;
    const walk = (items: TreeSelectData[]): void => {
      for (const item of items) {
        total += 1;
        const children = item['children'] as TreeSelectData[] | undefined;
        if (children?.length) walk(children);
      }
    };
    walk(this.data);
    return total;
  });
}
