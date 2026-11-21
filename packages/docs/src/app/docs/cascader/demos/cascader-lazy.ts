import { Component, signal } from '@angular/core';
import { TButton, TCascader } from '@tdesign-ng/components';
import type { CascaderOption, CascaderValue } from '@tdesign-ng/components';

@Component({
  selector: 'demo-cascader-lazy',
  imports: [TCascader, TButton],
  template: `
    <div class="demo-cascader-row" style="max-width: 360px; margin-bottom: 16px">
      <t-cascader
        [options]="options"
        [load]="load"
        loadingText="正在加载城市…"
        [clearable]="true"
        (change)="selected.set($event.value)"
      />
      <p class="demo-hint">选中：{{ selected() ?? '（空）' }}；点击省份后等待 600ms 加载城市（右箭头会变成加载中）。</p>
    </div>

    <div class="demo-cascader-row" style="max-width: 360px">
      <p class="demo-hint">
        受控 loading：{{ loading() ? '面板显示加载文案' : '面板显示选项' }}
        <t-button size="small" variant="outline" (click)="loading.set(!loading())">切换</t-button>
      </p>
      <t-cascader
        [options]="options"
        [loading]="loading()"
        loadingText="正在加载选项…"
        placeholder="loading 演示"
      />
    </div>
  `,
})
export class DemoCascaderLazy {
  protected readonly selected = signal<CascaderValue | undefined>(undefined);
  protected readonly loading = signal(true);

  protected readonly options: CascaderOption[] = [
    { label: '广东省', value: 'guangdong' },
    { label: '浙江省', value: 'zhejiang' },
    { label: '四川省', value: 'sichuan' },
  ];

  private readonly cities: Record<string, CascaderOption[]> = {
    guangdong: [
      { label: '深圳市', value: 'shenzhen', isLeaf: true },
      { label: '广州市', value: 'guangzhou', isLeaf: true },
      { label: '珠海市', value: 'zhuhai', isLeaf: true },
    ],
    zhejiang: [
      { label: '杭州市', value: 'hangzhou', isLeaf: true },
      { label: '宁波市', value: 'ningbo', isLeaf: true },
    ],
    sichuan: [{ label: '成都市', value: 'chengdu', isLeaf: true }],
  };

  protected readonly load = (option: CascaderOption): Promise<CascaderOption[]> =>
    new Promise((resolve) => {
      setTimeout(() => resolve(this.cities[String(option['value'])] ?? []), 600);
    });
}
