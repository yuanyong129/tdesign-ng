import { Component } from '@angular/core';
import { TTree } from '@tdesign-ng/components';
import type { TreeOption, TreeNodeModel } from '@tdesign-ng/components';

@Component({
  selector: 'demo-tree-lazy',
  imports: [TTree],
  template: `
    <div style="max-width: 320px">
      <t-tree [data]="data" [load]="loadChildren" [line]="true" />
    </div>
  `,
})
export class DemoTreeLazy {
  protected readonly data: TreeOption[] = [
    { value: '1', label: '第一层节点 1', children: true },
    { value: '2', label: '第一层节点 2', children: true },
    { value: '3', label: '第一层节点 3' },
  ];

  /** 展开 `children: true` 的节点时调用，返回（或 resolve）子节点数组。 */
  protected readonly loadChildren = (node: TreeNodeModel): Promise<TreeOption[]> =>
    new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          { value: `${node.value}-1`, label: `${node.label} / 子节点 1` },
          { value: `${node.value}-2`, label: `${node.label} / 子节点 2`, children: true },
        ]);
      }, 400);
    });
}
