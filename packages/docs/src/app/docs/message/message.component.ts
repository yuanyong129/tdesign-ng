import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoMessageBasic } from './demos/message-basic';
import { DemoMessageDuration } from './demos/message-duration';
import { DemoMessagePlacement } from './demos/message-placement';
import { DemoMessageContent } from './demos/message-content';
import { DemoMessageAttachment } from './demos/message-attachment';

@Component({
  selector: 'message-docs',
  imports: [ApiTable, DemoBlock, PageNav, DemoMessageBasic, DemoMessageDuration, DemoMessagePlacement, DemoMessageContent, DemoMessageAttachment],
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
      <p class="demo-hint">provideTMessage 的默认字段与单次配置合并，单次配置优先，显式 false / 空串保留。loading 的默认时长为 0，仍可通过单次配置或 duration 参数覆盖；同一服务内，实际挂载节点、placement、zIndex 均相同才共享容器，zIndex=0 保留，非有限值按 6000 处理。offset 仍是每条消息的 [left, top] 位移，数字按像素处理。</p>
      <docs-demo id="message-attachment" title="挂载点与容器隔离" description="将带 TInput 和 TButton 的模板消息挂载到 TCard 区域，多个挂载点和层级独立清理。">
        <demo-message-attachment />
      </docs-demo>
      <p class="demo-hint">服务 attach 支持选择器、HTMLElement 或返回节点/选择器的函数，每次创建解析一次；null 或无效选择器、缺失/未连接/跨文档节点、反馈容器内节点和抛错函数回退 body，html 目标也按 body 处理。已有消息不因函数返回值或 DOM 改变而自动迁移；外部移除容器后新建消息使用新容器，旧句柄只释放原容器。调用方移除目标不会自动销毁 Angular 实例，仍需 close / closeAll 或销毁作用域。容器只归当前服务所有，关闭不会移除调用方节点或改写其样式。</p>
      <p class="demo-hint">attach 只改变 DOM 挂载位置，列表仍是 vendor 的 fixed 定位，目标的 transform、overflow 和层叠上下文规则继续生效。style 对象作用于单条消息，支持 camelCase、CSS 属性名和自定义属性；长度使用带单位字符串，数值适用于 opacity 等无单位属性，null / undefined / 非有限数值忽略；style 优先于消息 offset，不修改传入对象。运行时 config()、完整 SSR / 水合及嵌套焦点管理仍待后续。</p>
      <h2 class="docs-section__title" id="message-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TMessage" />
      </div>

      <docs-page-nav current="/message" />
    </div>
  `,
})
export class MessageDocs {}
