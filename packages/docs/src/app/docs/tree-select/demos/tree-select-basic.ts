import { Component, signal } from '@angular/core';
import { TTreeSelect } from '@tdesign-ng/components';
import type { TreeSelectData, TreeSelectValue } from '@tdesign-ng/components';

@Component({
  selector: 'demo-tree-select-basic',
  imports: [TTreeSelect],
  template: `
    <div class="demo-tree-select-row" style="max-width: 360px">
      <t-tree-select [data]="data" [value]="value()" (change)="value.set($event.value)" />
      <p class="demo-hint">当前选中：{{ value() ?? '（空）' }}；点击箭头展开，点击节点文字选中并收起面板。</p>
    </div>
  `,
})
export class DemoTreeSelectBasic {
  protected readonly value = signal<TreeSelectValue | undefined>('nanshan');

  protected readonly data: TreeSelectData[] = [
    {
      label: '广东省',
      value: 'guangdong',
      children: [
        {
          label: '深圳市',
          value: 'shenzhen',
          children: [
            { label: '南山区', value: 'nanshan' },
            { label: '福田区', value: 'futian' },
          ],
        },
        {
          label: '广州市',
          value: 'guangzhou',
          children: [
            { label: '天河区', value: 'tianhe' },
            { label: '越秀区', value: 'yuexiu' },
          ],
        },
      ],
    },
    {
      label: '浙江省',
      value: 'zhejiang',
      children: [
        {
          label: '杭州市',
          value: 'hangzhou',
          children: [
            { label: '西湖区', value: 'xihu' },
            { label: '滨江区', value: 'binjiang' },
          ],
        },
      ],
    },
  ];
}
