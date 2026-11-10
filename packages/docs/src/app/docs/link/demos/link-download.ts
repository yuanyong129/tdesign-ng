import { Component } from '@angular/core';
import { TLinkModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-link-download',
  imports: [TLinkModule],
  template: `
    <t-link href="data:text/plain;charset=utf-8,hello" download="hello.txt" theme="primary">
      下载文件
    </t-link>
  `,
})
export class DemoLinkDownload {}
