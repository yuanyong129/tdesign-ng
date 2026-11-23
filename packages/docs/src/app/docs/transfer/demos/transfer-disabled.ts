import { Component } from '@angular/core';
import { TCheckboxModule, TTransferModule, type TransferItem, type TransferValue } from '@tdesign-ng/components';

@Component({
  selector: 'demo-transfer-disabled',
  imports: [TCheckboxModule, TTransferModule],
  template: `
    <t-checkbox [(checked)]="disabled">禁用整个穿梭框</t-checkbox>
    <t-transfer
      [data]="data"
      [disabled]="disabled"
      [title]="['源列表', '目标列表']"
      [(targetValue)]="targetValue"
    />
  `,
})
export class DemoTransferDisabled {
  protected readonly data: TransferItem[] = [
    { value: 1, label: '内容 1' },
    { value: 2, label: '内容 2（禁用）', disabled: true },
    { value: 3, label: '内容 3' },
    { value: 4, label: '内容 4（禁用）', disabled: true },
    { value: 5, label: '内容 5' },
  ];

  protected targetValue: TransferValue[] = [3];

  protected disabled = false;
}
