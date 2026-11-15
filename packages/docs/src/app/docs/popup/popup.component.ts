import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoPopupArrow } from './demos/popup-arrow';
import { DemoPopupBasic } from './demos/popup-basic';
import { DemoPopupContent } from './demos/popup-content';
import { DemoPopupPlacement } from './demos/popup-placement';
import { DemoPopupTrigger } from './demos/popup-trigger';

@Component({
  selector: 'popup-docs',
  imports: [
    ApiTable,
    DemoBlock,
    PageNav,
    DemoPopupBasic,
    DemoPopupPlacement,
    DemoPopupTrigger,
    DemoPopupArrow,
    DemoPopupContent,
  ],
  template: `
    <div class="docs-page">
      <h1 class="docs-page__title">弹出层 Popup</h1>
      <p class="docs-page__lead">
        弹出层是最基础的浮层：默认投影的内容是触发器，弹层内容用 content 或 [tPopupContent]
        提供，定位由 CDK Overlay 完成。
      </p>

      <docs-demo id="popup-basic" title="基础用法" description="默认 hover 触发，content 传入纯文本内容。">
        <demo-popup-basic />
      </docs-demo>

      <docs-demo id="popup-placement" title="出现位置" description="placement 支持 12 个方向，空间不足时会自动翻转。">
        <demo-popup-placement />
      </docs-demo>

      <docs-demo id="popup-trigger" title="触发方式" description="hover / click / focus / mousedown / context-menu。">
        <demo-popup-trigger />
      </docs-demo>

      <docs-demo id="popup-arrow" title="箭头" description="showArrow 控制是否显示箭头。">
        <demo-popup-arrow />
      </docs-demo>

      <docs-demo id="popup-content" title="自定义内容" description="用 [tPopupContent] 投影任意模板。">
        <demo-popup-content />
      </docs-demo>

      <h2 class="docs-section__title" id="popup-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TPopup" />
      </div>

      <docs-page-nav current="/popup" />
    </div>
  `,
})
export class PopupDocs {}
