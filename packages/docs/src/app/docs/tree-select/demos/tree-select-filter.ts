import { Component, signal } from '@angular/core';
import { TTreeSelect } from '@tdesign-ng/components';
import type { TreeSelectData, TreeSelectValue } from '@tdesign-ng/components';

@Component({
  selector: 'demo-tree-select-filter',
  imports: [TTreeSelect],
  template: `
    <div class="demo-tree-select-row" style="max-width: 380px; margin-bottom: 16px">
      <p class="demo-hint">filterable：输入关键字后只保留命中节点及其父级（父级置灰）</p>
      <t-tree-select
        [data]="data"
        [filterable]="true"
        [clearable]="true"
        placeholder="输入部门或小组名"
        (change)="first.set($event.value)"
      />
      <p class="demo-hint">选中：{{ first() ?? '（空）' }}</p>
    </div>

    <div class="demo-tree-select-row" style="max-width: 380px; margin-bottom: 16px">
      <p class="demo-hint">filter：自定义搜索函数（这里只匹配以关键字开头的节点）</p>
      <t-tree-select
        [data]="data"
        [filterable]="true"
        [filter]="startsWith"
        [clearable]="true"
        placeholder="输入开头几个字"
        (change)="second.set($event.value)"
      />
      <p class="demo-hint">选中：{{ second() ?? '（空）' }}</p>
    </div>

    <div class="demo-tree-select-row" style="max-width: 380px">
      <p class="demo-hint">受控 inputValue：关键字由外部状态控制，search 事件同步回写</p>
      <t-tree-select
        [data]="data"
        [filterable]="true"
        [inputValue]="keyword()"
        [clearable]="true"
        (search)="keyword.set($event)"
        (change)="third.set($event.value)"
      />
      <p class="demo-hint">关键字：{{ keyword() || '（空）' }}；选中：{{ third() ?? '（空）' }}</p>
    </div>
  `,
})
export class DemoTreeSelectFilter {
  protected readonly first = signal<TreeSelectValue | undefined>(undefined);
  protected readonly second = signal<TreeSelectValue | undefined>(undefined);
  protected readonly third = signal<TreeSelectValue | undefined>(undefined);
  protected readonly keyword = signal('');

  protected readonly startsWith = (keyword: string, data: TreeSelectData): boolean =>
    String(data['label'] ?? '').startsWith(keyword);

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
    {
      label: '设计部',
      value: 'design',
      children: [{ label: '交互组', value: 'ux' }],
    },
  ];
}
