import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoMessageBasic } from './demos/message-basic';
import { DemoMessageDuration } from './demos/message-duration';
import { DemoMessagePlacement } from './demos/message-placement';
import { DemoMessageContent } from './demos/message-content';

@Component({
  selector: 'message-docs',
  imports: [ApiTable, DemoBlock, PageNav, DemoMessageBasic, DemoMessageDuration, DemoMessagePlacement, DemoMessageContent],
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

      <docs-demo id="message-content" title="模板内容与服务生命周期" description="使用 TButton 构建消息内操作，模板绑定实时更新，局部服务销毁自动清理自有消息。">
        <demo-message-content />
      </docs-demo>
      <p class="demo-hint">content、icon、closeBtn 支持字符串或 TemplateRef；icon=false 隐藏图标，closeBtn=false 隐藏关闭入口。组件式关闭后隐藏自身，重新显示需要重建组件；duration 为正且有限时自动关闭，悬停暂停，离开后从完整时长重新计时，修改时长也重新计时。durationEnd 仅在到时触发，close 带关闭来源，closeBtnClick 仅在关闭入口触发，入口支持 Enter / 空格。服务同步返回 close() 句柄，重复关闭或 closeAll 后调用旧句柄均安全；closeAll 只处理调用时已存在的本服务消息，回调中新建消息保留。服务 onClose 对所有关闭来源调用，程序关闭的 context 为 undefined；不模拟上游 Promise 返回值或退出动画。</p>
      <p class="demo-hint">provideTMessage 的默认字段与单次配置合并，单次配置优先，显式 false / 空串保留。loading 的默认时长为 0，仍可通过单次配置或 duration 参数覆盖；同一位置共享容器，容器 zIndex 由首条消息决定。当前挂载到 body，自定义 attach / style、全局运行时 config()、完整 SSR / 水合及嵌套焦点管理仍待后续。</p>
      <h2 class="docs-section__title" id="message-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TMessage" />
      </div>

      <docs-page-nav current="/message" />
    </div>
  `,
})
export class MessageDocs {}
