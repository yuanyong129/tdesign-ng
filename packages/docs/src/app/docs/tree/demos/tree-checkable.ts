import { Component, signal } from '@angular/core';
import { TTree } from '@tdesign-ng/components';
import type { TreeOption, TreeValue } from '@tdesign-ng/components';

@Component({
  selector: 'demo-tree-checkable',
  imports: [TTree],
  template: `
    <div style="max-width: 320px">
      <t-tree
        [data]="data"
        [value]="picked()"
        [checkable]="true"
        [valueMode]="'parentFirst'"
        (valueChange)="picked.set($event)"
      />
    </div>
    <p class="demo-hint">当前选中：{{ picked().length ? picked().join('、') : '无' }}</p>
  `,
})
export class DemoTreeCheckable {
  protected readonly picked = signal<TreeValue[]>(['1-1']);

  protected readonly data: TreeOption[] = [
    {
      value: '1',
      label: '华东区域',
      children: [
        { value: '1-1', label: '上海' },
        { value: '1-2', label: '南京' },
        { value: '1-3', label: '杭州' },
      ],
    },
    {
      value: '2',
      label: '华南区域',
      children: [
        { value: '2-1', label: '广州' },
        { value: '2-2', label: '深圳' },
      ],
    },
    { value: '3', label: '海外区域' },
  ];
}
