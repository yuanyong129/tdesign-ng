import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TFormModule, TInputModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-form-label',
  imports: [FormsModule, TFormModule, TInputModule],
  template: `
    <t-form labelAlign="left" labelWidth="120px" [colon]="true">
      <t-form-item label="活动名称" name="title">
        <t-input name="title" [(ngModel)]="model.title" placeholder="请输入活动名称" />
      </t-form-item>
      <t-form-item label="活动地点" name="place">
        <t-input name="place" [(ngModel)]="model.place" placeholder="请输入活动地点" />
      </t-form-item>
      <t-form-item label="备注" name="remark" help="标签宽度由 labelWidth 控制，colon 在标签后加冒号">
        <t-input name="remark" [(ngModel)]="model.remark" placeholder="选填" />
      </t-form-item>
    </t-form>
  `,
})
export class DemoFormLabel {
  protected model = { title: '', place: '', remark: '' };
}
