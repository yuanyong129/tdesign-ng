import { Component, signal } from '@angular/core';
import { TTreeSelect } from '@tdesign-ng/components';
import type { TreeSelectData, TreeSelectKeys, TreeSelectValue } from '@tdesign-ng/components';

@Component({
  selector: 'demo-tree-select-options',
  imports: [TTreeSelect],
  template: `
    <div class="demo-tree-select-list">
      <t-tree-select
        style="max-width: 360px"
        [data]="data"
        [value]="value()"
        [clearable]="true"
        (change)="value.set($event.value)"
      />
      <t-tree-select style="max-width: 360px" [data]="data" size="small" [disabled]="true" defaultValue="hangzhou" />
      <t-tree-select
        style="max-width: 360px"
        [data]="keyed"
        [keys]="keys"
        valueType="object"
        [value]="objectValue()"
        (change)="objectValue.set($event.value)"
      />
      <t-tree-select style="max-width: 360px" [data]="data" size="large" placeholder="请选择地区" />
    </div>
    <p class="demo-hint">
      第一个可清空，第二个禁用，第三个用自定义 keys（name / code / items）并以 valueType="object" 返回整个数据项（当前：{{
        objectLabel()
      }}），第四个是 large 尺寸与占位文案。
    </p>
  `,
})
export class DemoTreeSelectOptions {
  protected readonly value = signal<TreeSelectValue | undefined>('shenzhen');
  protected readonly objectValue = signal<TreeSelectValue | undefined>(undefined);

  protected readonly keys: TreeSelectKeys = { label: 'name', value: 'code', children: 'items' };

  protected readonly data: TreeSelectData[] = [
    {
      label: '广东省',
      value: 'guangdong',
      children: [
        { label: '深圳市', value: 'shenzhen' },
        { label: '广州市', value: 'guangzhou' },
      ],
    },
    {
      label: '浙江省',
      value: 'zhejiang',
      children: [
        { label: '杭州市', value: 'hangzhou' },
        { label: '宁波市', value: 'ningbo' },
      ],
    },
  ];

  protected readonly keyed: TreeSelectData[] = [
    {
      name: '研发中心',
      code: 'rd',
      items: [
        { name: '前端组', code: 'fe' },
        { name: '后端组', code: 'be' },
      ],
    },
    {
      name: '设计中心',
      code: 'design',
      items: [{ name: '交互组', code: 'ux' }],
    },
  ];

  protected objectLabel(): string {
    const value = this.objectValue();
    return value && typeof value === 'object' ? String(value['name'] ?? '（空）') : '（空）';
  }
}
