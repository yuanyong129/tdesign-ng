import { Component, signal } from '@angular/core';
import { TCascader } from '@tdesign-ng/components';
import type { CascaderOption, CascaderValue } from '@tdesign-ng/components';

@Component({
  selector: 'demo-cascader-filter',
  imports: [TCascader],
  template: `
    <div class="demo-cascader-row" style="max-width: 360px; margin-bottom: 16px">
      <p class="demo-hint">filterable：输入关键字后切换成扁平搜索结果，命中文字高亮</p>
      <t-cascader
        [options]="options"
        [filterable]="true"
        [clearable]="true"
        placeholder="输入关键字搜索城市"
        (change)="first.set($event.value)"
      />
      <p class="demo-hint">选中：{{ first() ?? '（空）' }}</p>
    </div>

    <div class="demo-cascader-row" style="max-width: 360px">
      <p class="demo-hint">filter：自定义搜索函数（这里只匹配节点自身文案，不匹配父级路径）</p>
      <t-cascader
        [options]="options"
        [filterable]="true"
        [filter]="matchLabel"
        [clearable]="true"
        placeholder="只搜当前层级"
        (change)="second.set($event.value)"
      />
      <p class="demo-hint">选中：{{ second() ?? '（空）' }}</p>
    </div>
  `,
})
export class DemoCascaderFilter {
  protected readonly first = signal<CascaderValue | undefined>(undefined);
  protected readonly second = signal<CascaderValue | undefined>(undefined);

  protected readonly matchLabel = (keyword: string, option: CascaderOption): boolean =>
    String(option['label'] ?? '').includes(keyword);

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
