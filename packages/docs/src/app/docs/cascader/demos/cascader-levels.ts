import { Component, signal } from '@angular/core';
import { TCascader } from '@tdesign-ng/components';
import type { CascaderOption, CascaderValue } from '@tdesign-ng/components';

@Component({
  selector: 'demo-cascader-levels',
  imports: [TCascader],
  template: `
    <div class="demo-cascader-list">
      <t-cascader
        [options]="options"
        [showAllLevels]="true"
        [value]="first()"
        (change)="first.set($event.value)"
      />
      <t-cascader
        [options]="options"
        [showAllLevels]="false"
        [value]="second()"
        (change)="second.set($event.value)"
      />
    </div>
    <p class="demo-hint">第一个 showAllLevels 为 true（默认）显示「广东省 / 深圳市 / 南山区」，第二个只显示最后一级。</p>
  `,
})
export class DemoCascaderLevels {
  protected readonly first = signal<CascaderValue | undefined>('nanshan');
  protected readonly second = signal<CascaderValue | undefined>('nanshan');

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
      ],
    },
  ];
}
