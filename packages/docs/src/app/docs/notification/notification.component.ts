import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoNotificationBasic } from './demos/notification-basic';
import { DemoNotificationCustom } from './demos/notification-custom';
import { DemoNotificationPlacement } from './demos/notification-placement';

@Component({
  selector: 'notification-docs',
  imports: [ApiTable, DemoBlock, PageNav, DemoNotificationBasic, DemoNotificationCustom, DemoNotificationPlacement],
  template: `
    <div class="docs-page">
      <h1 class="docs-page__title">通知 Notification</h1>
      <p class="docs-page__lead">
        通知用于承载比全局提示更完整的信息，通过 TNotificationService 调用，默认出现在右上角。
      </p>

      <docs-demo id="notification-basic" title="基础用法" description="四种主题，默认 3 秒后自动关闭。">
        <demo-notification-basic />
      </docs-demo>

      <docs-demo id="notification-custom" title="标题、内容与底部" description="footer 可以补充说明，duration 为 0 时不自动关闭。">
        <demo-notification-custom />
      </docs-demo>

      <docs-demo id="notification-placement" title="出现位置" description="四个角都可以作为通知容器。">
        <demo-notification-placement />
      </docs-demo>

      <h2 class="docs-section__title" id="notification-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TNotification" />
      </div>

      <docs-page-nav current="/notification" />
    </div>
  `,
})
export class NotificationDocs {}
