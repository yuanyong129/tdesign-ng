import { Component } from '@angular/core';
import { TProgress } from '@tdesign-ng/components';

@Component({
  selector: 'demo-progress-color',
  imports: [TProgress],
  template: `
    <div class="demo-progress-list">
      <t-progress [percentage]="60" color="#0052d9" trackColor="#e7e7e7" />
      <t-progress [percentage]="60" [color]="gradient" />
      <t-progress [percentage]="60" [color]="segments" />
      <t-progress theme="circle" [percentage]="75" color="#00a870" trackColor="#e7e7e7" />
    </div>
    <p class="demo-hint">color 支持单色、渐变数组与「百分比 → 颜色」对象；trackColor 控制轨道颜色，circle 主题下作用于外圈。</p>
  `,
})
export class DemoProgressColor {
  protected readonly gradient = ['#0052d9', '#00a870'];
  protected readonly segments: Record<string, string> = {
    '0%': '#f6b26b',
    '50%': '#0052d9',
    '100%': '#00a870',
  };
}
