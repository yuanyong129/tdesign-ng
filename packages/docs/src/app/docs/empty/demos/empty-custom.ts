import { Component } from '@angular/core';
import { TButton, TEmpty, TEmptyAction } from '@tdesign-ng/components';

@Component({
  selector: 'demo-empty-custom',
  imports: [TEmpty, TEmptyAction, TButton],
  template: `
    <t-empty
      title="还没有创建任何项目"
      description="创建第一个项目后，这里会展示项目的统计数据。"
      [image]="image"
      [imageStyle]="{ width: '96px', height: '96px' }"
    >
      <t-button tEmptyAction theme="primary">新建项目</t-button>
    </t-empty>
    <p class="demo-hint">传入 image 可以用自定义图片替换内置插图，imageStyle 控制图片尺寸。</p>
  `,
})
export class DemoEmptyCustom {
  protected readonly image =
    'data:image/svg+xml;utf8,' +
    encodeURIComponent(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96">
        <rect x="4" y="20" width="88" height="64" rx="8" fill="#E7F0FF" stroke="#0052D9" stroke-width="2"/>
        <path d="M4 32h88" stroke="#0052D9" stroke-width="2"/>
        <circle cx="16" cy="26" r="3" fill="#0052D9"/>
        <path d="M28 52h40M28 64h26" stroke="#0052D9" stroke-width="4" stroke-linecap="round"/>
      </svg>`,
    );
}
