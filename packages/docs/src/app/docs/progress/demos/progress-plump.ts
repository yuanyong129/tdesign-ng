import { Component } from '@angular/core';
import { TProgress } from '@tdesign-ng/components';

@Component({
  selector: 'demo-progress-plump',
  imports: [TProgress],
  template: `
    <div class="demo-progress-list">
      <t-progress theme="plump" [percentage]="70" />
      <t-progress theme="plump" [percentage]="30" status="warning" />
      <t-progress theme="plump" [percentage]="8" />
      <t-progress theme="plump" size="small" [percentage]="50" status="error" />
    </div>
    <p class="demo-hint">plump 主题的百分比内嵌在进度条里；进度小于 10% 时标签会移到条外，size 支持 small。</p>
  `,
})
export class DemoProgressPlump {}
