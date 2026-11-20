import { Component } from '@angular/core';
import { TProgress } from '@tdesign-ng/components';

@Component({
  selector: 'demo-progress-circle',
  imports: [TProgress],
  template: `
    <div class="demo-progress-row">
      <t-progress theme="circle" size="small" [percentage]="25" />
      <t-progress theme="circle" [percentage]="60" status="warning" />
      <t-progress theme="circle" size="large" [percentage]="100" status="success" />
      <t-progress theme="circle" size="90" [strokeWidth]="4" [percentage]="40" status="error" />
    </div>
    <p class="demo-hint">circle 主题的 size 支持 small / medium / large 或自定义像素，strokeWidth 控制圆环宽度。</p>
  `,
})
export class DemoProgressCircle {}
