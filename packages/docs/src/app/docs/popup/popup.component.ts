import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoPopupArrow } from './demos/popup-arrow';
import { DemoPopupBasic } from './demos/popup-basic';
import { DemoPopupContent } from './demos/popup-content';
import { DemoPopupPlacement } from './demos/popup-placement';
import { DemoPopupTrigger } from './demos/popup-trigger';
import { DemoPopupLifecycle } from './demos/popup-lifecycle';

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
    DemoPopupLifecycle,
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

      <docs-demo id="popup-lifecycle" title="显隐、样式与生命周期" description="defaultVisible 只初始化一次；visible 受控时，事件和实例方法只发修改提案。内容区域可滚动，通过样式对象或函数设置内外层样式。">
        <demo-popup-lifecycle />
      </docs-demo>
      <p class="demo-hint">visible 优先于 defaultVisible；受控父级拒绝提案时保持实际显隐。程序同步不输出 visibleChange，重复 show / hide 不重复通知；visibleChangeContext 提供 {{ '{ visible, trigger, e }' }}，visibleChange 保持布尔值以支持双向绑定。禁用会关闭实际浮层并取消延迟，但保留请求的显隐值，恢复后按当前请求显示；不发送伪造的用户提案。focus 触发时焦点进入自己的面板不关闭，离开后关闭。销毁移除文档监听器、延迟任务和浮层。</p>
      <p class="demo-hint">overlayStyle 和 overlayInnerStyle 接受 NgStyle 样式对象，数字可用 width.px 等带单位键；函数参数是实际触发节点及 .t-popup__content。配置变化和每次打开重新计算，异步内容变化后可调用 update()；getOverlay() 返回 .t-popup 根节点。scroll / scrollToBottom 返回 {{ '{ e: Event }' }}，监听内容节点实际 scroll，后者在可滚动内容到底后 100ms 去抖，关闭时取消。attach、triggerElement、popperOptions 仍未实现；复合组件 PopupOptions 保持原有白名单，尚未透传新样式字段。完整 SSR / 水合与嵌套弹层焦点栈继续留待后续。</p>

      <h2 class="docs-section__title" id="popup-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TPopup" />
      </div>

      <docs-page-nav current="/popup" />
    </div>
  `,
})
export class PopupDocs {}
