import { Component, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TButton, TCheckTag, TCheckTagGroup } from '@tdesign-ng/components';

@Component({
  selector: 'demo-check-tag-props',
  imports: [TButton, TCheckTag, TCheckTagGroup, ReactiveFormsModule],
  template: `
    <ng-template #icon><span class="t-icon" aria-hidden="true">★</span></ng-template>
    <t-check-tag defaultChecked size="large"
      [checkedProps]="{ theme: 'success', variant: 'light', shape: 'round', size: 'small',
        color: '#0052d9', maxWidth: 120, title: '选中配置', icon: icon, closable: true, onClose: recordClose }"
      [uncheckedProps]="{ theme: 'warning', variant: 'outline', shape: 'mark' }">
      点击切换状态与外观
    </t-check-tag>
    <p aria-live="polite">关闭回调 {{ closes() }} 次（关闭按钮不切换选中状态）</p>
    <t-check-tag disabled [checkedProps]="{ disabled: false }" defaultChecked>显式禁用优先</t-check-tag>
    <t-check-tag [formControl]="control">表单禁用</t-check-tag>
    <p>组选中值：{{ value().join(', ') || '无' }}</p>
    <t-check-tag-group [options]="options" [multiple]="multiple()" [(value)]="value"
      [checkedProps]="{ theme: 'success', variant: 'outline', shape: 'round', size: 'small' }"
      [uncheckedProps]="{ theme: 'warning', variant: 'light', size: 'small' }" />
    <t-button variant="text" (click)="multiple.set(!multiple())">切换为{{ multiple() ? '单选' : '多选' }}</t-button>
  `,
})
export class DemoCheckTagProps {
  readonly closes = signal(0);
  readonly recordClose = () => this.closes.update((value) => value + 1);
  readonly control = new FormControl({ value: false, disabled: true }, { nonNullable: true });
  readonly multiple = signal(true);
  readonly value = signal<Array<string | number>>(['a']);
  readonly options = [
    { value: 'a', label: '选项 A' },
    { value: 'b', label: '选项 B', size: 'large' as const },
    { value: 'c', label: '禁用选项', disabled: true },
  ];
}
