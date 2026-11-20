import { Component } from '@angular/core';
import { TProgress } from '@tdesign-ng/components';

@Component({
  selector: 'demo-progress-status',
  imports: [TProgress],
  template: `
    <div class="demo-progress-list">
      <t-progress [percentage]="100" status="success" />
      <t-progress [percentage]="60" status="warning" />
      <t-progress [percentage]="40" status="error" />
      <t-progress [percentage]="70" status="active" />
    </div>
    <p class="demo-hint">status 支持 success / warning / error / active，成功、警告、错误会用状态图标替换百分比。</p>
  `,
})
export class DemoProgressStatus {}
