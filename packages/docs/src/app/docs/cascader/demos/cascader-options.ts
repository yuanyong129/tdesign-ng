import { Component, signal } from '@angular/core';
import { TCascader } from '@tdesign-ng/components';
import type { CascaderKeys, CascaderOption, CascaderValue } from '@tdesign-ng/components';

@Component({
  selector: 'demo-cascader-options',
  imports: [TCascader],
  template: `
    <div class="demo-cascader-list">
      <t-cascader [options]="options" [keys]="keys" [value]="value()" (change)="value.set($event.value)" />
      <t-cascader [options]="options" [keys]="keys" size="small" [disabled]="true" defaultValue="nj" />
      <t-cascader [options]="options" [keys]="keys" size="large" placeholder="请选择城市" />
    </div>
    <p class="demo-hint">keys 可自定义字段名（这里是 name / code / items），size 支持 small / medium / large，第二个为禁用态。</p>
  `,
})
export class DemoCascaderOptions {
  protected readonly value = signal<CascaderValue | undefined>('hz');
  protected readonly keys: CascaderKeys = { label: 'name', value: 'code', children: 'items' };

  protected readonly options: CascaderOption[] = [
    {
      name: '浙江省',
      code: 'zj',
      items: [
        { name: '杭州市', code: 'hz' },
        { name: '宁波市', code: 'nb' },
      ],
    },
    {
      name: '江苏省',
      code: 'js',
      items: [
        { name: '南京市', code: 'nj' },
        { name: '苏州市', code: 'sz' },
      ],
    },
  ] as unknown as CascaderOption[];
}

