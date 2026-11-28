import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoNotificationBasic } from './demos/notification-basic';
import { DemoNotificationCustom } from './demos/notification-custom';
import { DemoNotificationPlacement } from './demos/notification-placement';
import { DemoNotificationContent } from './demos/notification-content';
import { DemoNotificationAttachment } from './demos/notification-attachment';

@Component({
  selector: 'notification-docs',
  imports: [ApiTable, DemoBlock, PageNav, DemoNotificationBasic, DemoNotificationCustom, DemoNotificationPlacement, DemoNotificationContent, DemoNotificationAttachment],
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
      <p class="demo-hint">服务同步返回幂等 close()，closeAll 只销毁调用时本服务已有实例，服务销毁清理全部自有通知、计时任务和容器；onClose 在程序/按钮/到时关闭时均调用，onCloseBtnClick 和 onDurationEnd 只在对应来源调用。provideTNotification 的默认配置与单次配置合并。offset=[x,y] 现按锁定上游校准为容器距 placement 对应边缘的距离：top-right 为 right / top，bottom-left 为 left / bottom，数字按像素处理，缺省边距为 16px；不再给每条通知设置 left / top 位移。</p>
      <docs-demo id="notification-attachment" title="挂载点与容器隔离" description="将通知模板挂到 TCard 中，支持独立位置、层级和边距，操作使用 TButton 与 TInput。">
        <demo-notification-attachment />
      </docs-demo>
      <p class="demo-hint">attach 支持选择器、HTMLElement 或解析函数，每次创建时读取；null、缺失/非法/未连接/跨文档目标、反馈容器内部目标和抛错函数回退 body，html 也按 body 处理。同一服务内，实际节点、placement、zIndex 和最终边距相同才共享容器，不同服务分别拥有容器；zIndex=0 保留，非有限值按 6000 处理。每个句柄释放自己创建时的容器记录，外部移除后重建不受旧句柄影响；目标被移除时不会自动销毁实例，仍需关闭句柄或服务作用域。</p>
      <p class="demo-hint">容器沿用 vendor 的 fixed 定位，attach 不自动建立相对定位，也不修改目标样式；transform、裁剪和层叠上下文由浏览器规则决定。style 作用于单条通知，支持 CSS 文本或对象；对象支持 camelCase / CSS 名称 / 自定义属性，长度用带单位字符串，数值用于无单位属性，空值及非有限数值忽略。运行时 config()、上游 Promise 返回值、退出动画和完整 SSR / 水合仍待后续，不将生成零债务当作全部服务 API 完成。</p>
      <h2 class="docs-section__title" id="notification-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TNotification" />
      </div>

      <docs-page-nav current="/notification" />
    </div>
  `,
})
export class NotificationDocs {}
