import { Component, signal } from '@angular/core';
import { TCascader } from '@tdesign-ng/components';
import type { CascaderOption, CascaderValue } from '@tdesign-ng/components';

@Component({
  selector: 'demo-cascader-multiple',
  imports: [TCascader],
  template: `
    <div class="demo-cascader-row" style="max-width: 360px; margin-bottom: 16px">
      <p class="demo-hint">多选（父子关联，默认 onlyLeaf：只回传叶子节点）</p>
      <t-cascader
        [options]="options"
        [value]="linked()"
        [multiple]="true"
        [clearable]="true"
        (change)="linked.set($event.value)"
      />
      <p class="demo-hint">值：{{ fmt(linked()) }}</p>
    </div>

    <div class="demo-cascader-row" style="max-width: 360px; margin-bottom: 16px">
      <p class="demo-hint">父子不关联（checkStrictly：勾选父节点不影响子节点）</p>
      <t-cascader
        [options]="options"
        [value]="strict()"
        [multiple]="true"
        [checkStrictly]="true"
        [clearable]="true"
        (change)="strict.set($event.value)"
      />
      <p class="demo-hint">值：{{ fmt(strict()) }}</p>
    </div>

    <div class="demo-cascader-row" style="max-width: 360px">
      <p class="demo-hint">取值模式 valueMode="parentFirst"（父节点全选时回传父节点）</p>
      <t-cascader
        [options]="options"
        [value]="parentFirst()"
        [multiple]="true"
        valueMode="parentFirst"
        [clearable]="true"
        (change)="parentFirst.set($event.value)"
      />
      <p class="demo-hint">值：{{ fmt(parentFirst()) }}</p>
    </div>
  `,
})
export class DemoCascaderMultiple {
  protected readonly linked = signal<CascaderValue | undefined>(['nanshan', 'futian']);
  protected readonly strict = signal<CascaderValue | undefined>('guangdong');
  protected readonly parentFirst = signal<CascaderValue | undefined>(undefined);

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

  protected fmt(value: CascaderValue | undefined): string {
    if (Array.isArray(value)) return value.length ? `[${value.join(', ')}]` : '[]';
    return value === undefined ? '（空）' : String(value);
  }
}
