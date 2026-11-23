import { Component } from '@angular/core';
import { TButtonModule, TCardModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-card-basic',
  imports: [TCardModule, TButtonModule],
  template: `
    <ng-template #footerTpl>
      <div style="display: flex; gap: 8px; justify-content: flex-end">
        <t-button size="small" variant="outline" theme="primary">取消</t-button>
        <t-button size="small" theme="primary">确定</t-button>
      </div>
    </ng-template>

    <t-card
      style="width: 380px"
      title="卡片标题"
      subtitle="副标题"
      description="卡片描述，用于补充说明卡片承载的内容。"
      actions="操作"
      [footer]="footerTpl"
    >
      卡片内容，以描述性为主，可以是文字、图片或图文组合的形式，也可以利用其他 UI 组件进行封装或组合。
    </t-card>
  `,
})
export class DemoCardBasic {}
