import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoMessageBasic } from './demos/message-basic';
import { DemoMessageDuration } from './demos/message-duration';
import { DemoMessagePlacement } from './demos/message-placement';

@Component({
  selector: 'message-docs',
  imports: [ApiTable, DemoBlock, PageNav, DemoMessageBasic, DemoMessageDuration, DemoMessagePlacement],
  template: `
    <div class="docs-page">
      <h1 class="docs-page__title">全局提示 Message</h1>
      <p class="docs-page__lead">
        全局提示用于反馈操作结果，通过 TMessageService 以服务方式调用，渲染在 body 上，不受页面布局影响。
      </p>

      <docs-demo id="message-basic" title="基础用法" description="按主题调用 info / success / warning / error / question。">
        <demo-message-basic />
      </docs-demo>

      <docs-demo id="message-duration" title="关闭方式" description="duration 为 0 时不自动关闭，也可以手动 close。">
        <demo-message-duration />
      </docs-demo>

      <docs-demo id="message-placement" title="出现位置" description="placement 支持九个位置，closeAll 可以一次性清空。">
        <demo-message-placement />
      </docs-demo>

      <h2 class="docs-section__title" id="message-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TMessage" />
      </div>

      <docs-page-nav current="/message" />
    </div>
  `,
})
export class MessageDocs {}
