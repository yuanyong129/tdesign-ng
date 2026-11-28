import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoNotificationBasic } from './demos/notification-basic';
import { DemoNotificationCustom } from './demos/notification-custom';
import { DemoNotificationPlacement } from './demos/notification-placement';
import { DemoNotificationContent } from './demos/notification-content';

@Component({
  selector: 'notification-docs',
  imports: [ApiTable, DemoBlock, PageNav, DemoNotificationBasic, DemoNotificationCustom, DemoNotificationPlacement, DemoNotificationContent],
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

      <docs-demo id="notification-content" title="模板内容与服务生命周期" description="标题、正文、底部、图标和关闭内容支持模板，底部操作使用 TButton。">
        <demo-notification-content />
      </docs-demo>
      <p class="demo-hint">title、content、footer、icon、closeBtn 支持字符串或 TemplateRef，布尔 icon / closeBtn 控制默认图标和关闭入口。content 未设置时显示 ng-content，显式空串覆盖投影；模板正常参与 Angular 变更检测，关闭时销毁模板视图。组件式关闭后隐藏自身，重建组件可重新显示。duration 为正且有限时自动关闭，悬停暂停，离开后完整重新计时；durationEnd、closeBtnClick 按各自来源输出，close 保留本库来源上下文，关闭入口支持 Enter / 空格。</p>
      <p class="demo-hint">服务同步返回幂等 close()，closeAll 只销毁调用时本服务已有实例，服务销毁清理全部自有通知、计时任务和容器；onClose 在程序/按钮/到时关闭时均调用，onCloseBtnClick 和 onDurationEnd 只在对应来源调用。provideTNotification 的默认配置与单次配置合并，offset=[x,y] 支持数字像素或 CSS 长度，作用在每条通知上。同位置容器 zIndex 由首条通知决定；自定义 attach / style、运行时 config()、退出动画和完整 SSR / 水合仍待后续，不将本批视为全部服务 API 完成。</p>
      <h2 class="docs-section__title" id="notification-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TNotification" />
      </div>

      <docs-page-nav current="/notification" />
    </div>
  `,
})
export class NotificationDocs {}
