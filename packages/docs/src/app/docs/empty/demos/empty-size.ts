import { Component } from '@angular/core';
import { TEmpty } from '@tdesign-ng/components';

@Component({
  selector: 'demo-empty-size',
  imports: [TEmpty],
  template: `
    <div class="demo-empty-grid">
      <t-empty size="small" title="小尺寸" description="20px 插图" />
      <t-empty size="medium" title="中尺寸" description="48px 插图（默认）" />
      <t-empty size="large" title="大尺寸" description="64px 插图" />
    </div>
    <p class="demo-hint">size 控制插图尺寸与标题、描述的字号，默认是 medium。</p>
  `,
})
export class DemoEmptySize {}
