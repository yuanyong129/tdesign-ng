import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoQRCodeBase } from './demos/qrcode-base';
import { DemoQRCodeSize } from './demos/qrcode-size';
import { DemoQRCodeStatus } from './demos/qrcode-status';

@Component({
  selector: 'qrcode-docs',
  imports: [ApiTable, DemoBlock, PageNav, DemoQRCodeBase, DemoQRCodeSize, DemoQRCodeStatus],
  template: `
    <article class="docs-page">
      <h1 class="docs-page__title">二维码 QRCode</h1>
      <p class="docs-page__lead">
        把文本、链接等编码为二维码，支持 canvas 与 svg 两种渲染方式、四档纠错级别、中间图标，以及过期/已扫描等状态遮罩。
      </p>

      <docs-demo
        id="qrcode-base"
        title="基础用法"
        description="value 为要编码的内容，默认 160px、纠错级别 M、canvas 渲染。"
      >
        <demo-qrcode-base />
      </docs-demo>

      <docs-demo
        id="qrcode-size"
        title="尺寸与纠错级别"
        description="size 控制整体尺寸（含内边距），level 越高可恢复的损坏区域越大，同样内容需要的模块也越多；type 为 svg 时输出矢量。"
      >
        <demo-qrcode-size />
      </docs-demo>

      <docs-demo
        id="qrcode-status"
        title="状态与刷新"
        description="status 为 expired / scanned / loading 时在二维码上覆盖遮罩，过期状态下点击“点击刷新”触发 refresh 输出。"
      >
        <demo-qrcode-status />
      </docs-demo>

      <h2 class="docs-section__title" id="qrcode-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TQRCode" />
      </div>

      <docs-page-nav current="/qrcode" />
    </article>
  `,
})
export class QRCodeDocs {}
