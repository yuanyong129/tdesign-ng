import { Component } from '@angular/core';
import { TTree } from '@tdesign-ng/components';
import type { TreeOption } from '@tdesign-ng/components';

@Component({
  selector: 'demo-tree-base',
  imports: [TTree],
  template: `
    <div style="max-width: 320px">
      <t-tree
        [data]="data"
        [defaultExpanded]="expanded"
        [activable]="true"
        [hover]="true"
        [line]="true"
      />
    </div>
  `,
})
export class DemoTreeBase {
  protected readonly expanded = ['1'];

  protected readonly data: TreeOption[] = [
    {
      value: '1',
      label: '华东区域',
      children: [
        { value: '1-1', label: '上海' },
        {
          value: '1-2',
          label: '南京',
          children: [{ value: '1-2-1', label: '玄武区' }],
        },
      ],
    },
    {
      value: '2',
      label: '华南区域',
      children: [
        { value: '2-1', label: '广州' },
        { value: '2-2', label: '深圳', disabled: true },
      ],
    },
    { value: '3', label: '海外区域' },
  ];
}
