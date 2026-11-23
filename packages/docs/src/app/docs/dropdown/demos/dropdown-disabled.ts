import { Component } from '@angular/core';
import { TButtonModule, TDropdownModule } from '@tdesign-ng/components';
import type { DropdownOption } from '@tdesign-ng/components';

@Component({
  selector: 'demo-dropdown-disabled',
  imports: [TDropdownModule, TButtonModule],
  styles: [
    `
      .demo-row {
        display: flex;
        align-items: center;
        gap: 12px;
      }
    `,
  ],
  template: `
    <div class="demo-row">
      <t-dropdown [options]="options">
        <span><t-button variant="outline">部分选项禁用</t-button></span>
      </t-dropdown>
      <t-dropdown [options]="options" [disabled]="true">
        <span><t-button variant="outline" [disabled]="true">整个菜单禁用</t-button></span>
      </t-dropdown>
    </div>
  `,
})
export class DemoDropdownDisabled {
  protected readonly options: DropdownOption[] = [
    { content: '选项一', value: '1' },
    { content: '选项二（禁用）', value: '2', disabled: true },
    { content: '选项三', value: '3', divider: true },
  ];
}
