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
import { DemoPopupAttachment } from './demos/popup-attachment';
import { DemoPopupPositionOptions } from './demos/popup-position-options';

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
    DemoPopupAttachment,
    DemoPopupPositionOptions,
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
      <p class="demo-hint">overlayStyle 和 overlayInnerStyle 接受 NgStyle 样式对象，数字可用 width.px 等带单位键；函数参数是实际触发节点及 .t-popup__content。配置变化和每次打开重新计算，异步内容变化后可调用 update()；getOverlay() 返回 .t-popup 根节点。scroll / scrollToBottom 返回 {{ '{ e: Event }' }}，监听内容节点实际 scroll，后者在可滚动内容到底后 100ms 去抖，关闭时取消。attach / triggerElement 见下一示例；复合组件 PopupOptions 保持原有白名单，尚未透传新字段。完整 SSR / 水合与嵌套弹层焦点栈继续留待后续。</p>

      <docs-demo id="popup-attachment" title="挂载点与独立触发器" description="attach 支持选择器、DOM 节点或返回它们的函数；triggerElement 字符串选择外部节点，模板替换默认投影。切换挂载和触发器后保留当前浮层内容。">
        <demo-popup-attachment />
      </docs-demo>
      <p class="demo-hint">attach 使用实例独立容器，不移动全局 CDK 容器、不修改挂载目标样式；动态切换保留原浮层和组件状态。无效选择器、未连接/跨文档目标回退到默认 body 容器。滚动和窗口缩放会更新位置，支持祖先平移与正向轴对齐缩放；旋转、倾斜、负缩放及透视变换尚未支持。挂载目标的裁剪和层叠上下文继续生效。函数目标每次打开或 update() 重新解析。</p>
      <p class="demo-hint">triggerElement 的字符串是 CSS 选择器；找不到时实际浮层保持关闭，后续节点创建后调用 update() 或 show() 重新解析。切换会解绑旧节点事件，外部节点不会被移动或删除；模板支持动态绑定，未配置时用默认投影。手动改变外部节点布局或替换同选择器节点后可调用 update()。getOverlay() 仍返回实际 .t-popup；getPopper() 尚不提供，复合组件 PopupOptions 仍维持现有白名单。</p>

      <docs-demo id="popup-position-options" title="定位配置白名单" description="popperOptions 通过 CDK 实现部分 Popper 配置：位置覆盖、offset 偏移、flip 翻转和 preventOverflow 视口保护，不接受任意 Popper 插件。">
        <demo-popup-position-options />
      </docs-demo>
      <p class="demo-hint">PopupPopperOptions.placement 使用 top-start / bottom-end 等 Popper 拼写，设置时覆盖 placement。modifiers 支持 offset 的 [skidding, distance] 数字元组，正 distance 向远离触发器方向移动；flip 支持 enabled 与 fallbackPlacements，默认镜像翻转，空候选或 enabled=false 禁用翻转；preventOverflow 启用后使用 CDK 视口推移，padding 是非负统一边距，缺省 4px。重复同名配置最后一项生效，非法数值按缺省处理。配置变化会重新定位并保留内容，update() 可手动更新。</p>
      <p class="demo-hint">这是类型化的有限适配，不是完整 Popper。暂不支持 auto 方向、strategy、任意 modifier / phase / fn、偏移函数、非视口 boundary、分侧 padding、tether、mainAxis / altAxis、arrow 插件及实例生命周期回调；视口推移语义遵循 CDK，不保证与 Popper 像素一致。箭头和 data-popper-placement 沿用实际生效方向，getPopper() 不返回伪造实例。生成零债务仅表示当前属性契约已提供，以上嵌套配置能力仍有限制。</p>

      <h2 class="docs-section__title" id="popup-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TPopup" />
      </div>

      <docs-page-nav current="/popup" />
    </div>
  `,
})
export class PopupDocs {}
