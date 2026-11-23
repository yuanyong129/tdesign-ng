import { Component } from '@angular/core';
import { TTransferModule, type TransferItem, type TransferValue } from '@tdesign-ng/components';

@Component({
  selector: 'demo-transfer-base',
  imports: [TTransferModule],
  template: `
    <t-transfer [data]="data" [title]="['源列表', '目标列表']" [(targetValue)]="targetValue" />
    <p class="demo-hint">当前目标值：{{ targetValue.length ? targetValue.join('、') : '空' }}</p>
  `,
})
export class DemoTransferBase {
  protected readonly data: TransferItem[] = [
    { value: 1, label: '内容 1' },
    { value: 2, label: '内容 2' },
    { value: 3, label: '内容 3' },
    { value: 4, label: '内容 4' },
    { value: 5, label: '内容 5' },
  ];

  protected targetValue: TransferValue[] = [2, 4];
}
