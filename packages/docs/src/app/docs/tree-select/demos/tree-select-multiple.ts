import { Component, signal } from '@angular/core';
import { TTreeSelect } from '@tdesign-ng/components';
import type { TreeSelectData, TreeSelectTreeProps, TreeSelectValue } from '@tdesign-ng/components';

@Component({
  selector: 'demo-tree-select-multiple',
  imports: [TTreeSelect],
  template: `
    <div class="demo-tree-select-row" style="max-width: 380px; margin-bottom: 16px">
      <p class="demo-hint">多选（父子关联，默认 onlyLeaf：只回传叶子节点）</p>
      <t-tree-select
        [data]="data"
        [value]="linked()"
        [multiple]="true"
        [clearable]="true"
        (change)="linked.set($event.value)"
      />
      <p class="demo-hint">值：{{ fmt(linked()) }}</p>
    </div>

    <div class="demo-tree-select-row" style="max-width: 380px; margin-bottom: 16px">
      <p class="demo-hint">父子不关联（treeProps.checkStrictly：勾选父节点不影响子节点）</p>
      <t-tree-select
        [data]="data"
        [value]="strict()"
        [multiple]="true"
        [treeProps]="strictProps"
        [clearable]="true"
        (change)="strict.set($event.value)"
      />
      <p class="demo-hint">值：{{ fmt(strict()) }}</p>
    </div>

    <div class="demo-tree-select-row" style="max-width: 380px">
      <p class="demo-hint">valueMode="parentFirst" + max=3 + minCollapsedNum=1（父级全选回传父节点，最多一个标签 +N）</p>
      <t-tree-select
        [data]="data"
        [value]="capped()"
        [multiple]="true"
        [treeProps]="parentFirstProps"
        [max]="3"
        [minCollapsedNum]="1"
        [clearable]="true"
        (change)="capped.set($event.value)"
      />
      <p class="demo-hint">值：{{ fmt(capped()) }}</p>
    </div>
  `,
})
export class DemoTreeSelectMultiple {
  protected readonly linked = signal<TreeSelectValue | undefined>(['fe', 'be']);
  protected readonly strict = signal<TreeSelectValue | undefined>(['tech']);
  protected readonly capped = signal<TreeSelectValue | undefined>(undefined);

  protected readonly strictProps: TreeSelectTreeProps = { checkStrictly: true };
  protected readonly parentFirstProps: TreeSelectTreeProps = { valueMode: 'parentFirst', expandAll: true };

  protected readonly data: TreeSelectData[] = [
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
    {
      label: '产品部',
      value: 'product',
      children: [
        { label: '产品一组', value: 'p1' },
        { label: '产品二组', value: 'p2' },
      ],
    },
  ];

  protected fmt(value: TreeSelectValue | undefined): string {
    if (Array.isArray(value)) return value.length ? `[${value.join(', ')}]` : '[]';
    return value === undefined ? '（空）' : String(value);
  }
}
