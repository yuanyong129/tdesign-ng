import { Component } from '@angular/core';
import { TProgress } from '@tdesign-ng/components';

@Component({
  selector: 'demo-progress-basic',
  imports: [TProgress],
  template: `
    <div class="demo-progress-list">
      <t-progress [percentage]="20" />
      <t-progress [percentage]="45" />
      <t-progress [percentage]="70" />
      <t-progress [percentage]="100" />
    </div>
    <p class="demo-hint">默认是 line 主题，右侧显示百分比；百分比到 100 时自动变成成功态。</p>
  `,
})
export class DemoProgressBasic {}
