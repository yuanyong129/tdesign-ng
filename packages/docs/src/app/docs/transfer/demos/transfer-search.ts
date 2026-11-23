import { Component } from '@angular/core';
import {
  TTransferModule,
  type TransferItem,
  type TransferSearchEvent,
  type TransferValue,
} from '@tdesign-ng/components';

@Component({
  selector: 'demo-transfer-search',
  imports: [TTransferModule],
  template: `
    <t-transfer
      [data]="data"
      [search]="true"
      [searchPlaceholder]="['搜索源列表', '搜索目标列表']"
      [title]="['源列表', '目标列表']"
      [(targetValue)]="targetValue"
      (search)="handleSearch($event)"
    />
    <p class="demo-hint">最近一次搜索：{{ lastSearch || '无' }}</p>
  `,
})
export class DemoTransferSearch {
  protected readonly data: TransferItem[] = [
    { value: 1, label: '苹果 Apple' },
    { value: 2, label: '香蕉 Banana' },
    { value: 3, label: '樱桃 Cherry' },
    { value: 4, label: '榴莲 Durian' },
    { value: 5, label: '葡萄 Grape' },
    { value: 6, label: '柠檬 Lemon' },
  ];

  protected targetValue: TransferValue[] = [1];

  protected lastSearch = '';

  protected handleSearch(event: TransferSearchEvent): void {
    this.lastSearch = `${event.type} / ${event.query || '空'} / ${event.trigger}`;
  }
}
