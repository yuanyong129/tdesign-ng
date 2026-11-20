import { Component, signal } from '@angular/core';
import { TCascader } from '@tdesign-ng/components';
import type { CascaderOption, CascaderValue } from '@tdesign-ng/components';

@Component({
  selector: 'demo-cascader-basic',
  imports: [TCascader],
  template: `
    <div class="demo-cascader-row">
      <t-cascader
        [options]="options"
        [value]="value()"
        [clearable]="true"
        (change)="value.set($event.value)"
      />
    </div>
    <p class="demo-hint">当前选中：{{ value() ?? '（空）' }}；点击逐级展开，选中叶子节点后回填完整路径。</p>
  `,
})
export class DemoCascaderBasic {
  protected readonly value = signal<CascaderValue | undefined>('nanshan');

  protected readonly options: CascaderOption[] = [
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

