import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoDialogBasic } from './demos/dialog-basic';
import { DemoDialogCustom } from './demos/dialog-custom';
import { DemoDialogPlacement } from './demos/dialog-placement';
import { DemoDialogTheme } from './demos/dialog-theme';
import { DemoDialogLifecycle } from './demos/dialog-lifecycle';
import { DemoDialogContent } from './demos/dialog-content';

@Component({
  selector: 'dialog-docs',
  imports: [ApiTable, DemoBlock, PageNav, DemoDialogBasic, DemoDialogTheme, DemoDialogPlacement, DemoDialogCustom, DemoDialogLifecycle, DemoDialogContent],
  template: `
    <div class="docs-page">
      <h1 class="docs-page__title">对话框 Dialog</h1>
      <p class="docs-page__lead">
        对话框用于在页面之上承载需要用户确认或填写的临时内容，默认带遮罩、焦点陷阱与背景滚动锁定。
      </p>

      <docs-demo id="dialog-basic" title="基础用法" description="用 [(visible)] 控制显隐，遮罩、Esc、关闭按钮都能关闭。">
        <demo-dialog-basic />
      </docs-demo>

      <docs-demo id="dialog-theme" title="主题" description="theme 为非 default 时，头部会显示对应颜色的图标。">
        <demo-dialog-theme />
      </docs-demo>

      <docs-demo id="dialog-placement" title="位置与宽度" description="placement 控制垂直位置，width 控制宽度。">
        <demo-dialog-placement />
      </docs-demo>

      <docs-demo id="dialog-custom" title="自定义内容与底部" description="默认投影是内容，[tDialogFooter] 可以完全接管底部按钮。">
        <demo-dialog-custom />
      </docs-demo>

      <docs-demo id="dialog-lifecycle" title="受控显隐与生命周期" description="使用 TInput、TTextarea 和 TButton 验证受控拒绝关闭、模板生命周期及实例方法。">
        <demo-dialog-lifecycle />
      </docs-demo>
      <p class="demo-hint">visible 未设置时由 show / hide / toggle 管理；显式绑定后，用户关闭和实例方法仅发 visibleChange 提案，父组件接受后才改变实际状态。程序输入同步不输出 visibleChange，重复同值操作不输出。confirm 只通知确认，不自动关闭；confirmLoading 阻止确认。close 保留本库的 trigger / event 上下文，新增独立 closeBtnClick 与 escKeydown，关闭入口支持 Enter / 空格；禁用 Esc 关闭时仍输出 escKeydown。</p>
      <p class="demo-hint">beforeOpen / beforeClose 是实际状态变化前通知，不能通过返回 false 或 Promise 拦截，按锁定上游的 void 回调语义实现。opened / closed 表示相应状态渲染完成，不承诺上游动画时长；快速反转状态会取消过期的完成通知。lazy 控制首次创建 Dialog 自有 DOM 和正文模板，destroyOnClose 关闭时销毁这些视图，缺省关闭保留。外部 ng-content 子组件属于调用方，不能通过 Dialog 的 lazy / destroyOnClose 延迟构造或销毁，需调用方自行用条件控制。</p>
      <p class="demo-hint">body 支持字符串或 TemplateRef，显式空串也覆盖默认投影。confirmOnEnter 仅在对话框内非编辑、非原生激活控件区域生效；输入框、多行框、select、按钮、链接、contenteditable、IME 与重复按键不会额外触发确认。Dialog 之间按 zIndex、同层按打开顺序决定键盘和模态焦点陷阱归属，关闭顶层时尽量返回原触发器；外部已接管焦点时不强行拉回。modal / full-screen 共享按 Document 计数的 CDK 滚动锁，modeless / normal 不锁滚动、不设模态焦点陷阱；动态模式及 preventScrollThrough 变化会释放锁。</p>
      <docs-demo id="dialog-content" title="富内容与按钮配置" description="标题、关闭入口和底部支持模板；确认和取消支持文本、TButton 配置白名单及完整替换模板。">
        <demo-dialog-content />
      </docs-demo>
      <p class="demo-hint">header 支持文本、布尔值和模板；header=false 隐藏标题，关闭入口独立保留，二者均隐藏才不显示头部。closeBtn 支持默认图标、false、文本或模板；默认/文本入口支持键盘激活，模板使用自己的可访问控件（本例为 TButton），不再额外嵌套 role=button，内部原生按钮由 click 激活一次。footer=true 使用 tDialogFooter 投影（无投影时默认按钮），false 或空串隐藏底部；显式文本/模板覆盖投影，切换期间隐藏保留原投影。正文与标题文字按文本转义，富内容模板正常参与变更检测。</p>
      <p class="demo-hint">confirmBtn / cancelBtn 的 null 隐藏按钮，未配置使用默认文案；字符串替换文案，DialogButtonOptions 配置 TButton，TemplateRef 替换整个控件。配置 content 可为文本或标签模板，支持 theme / variant / shape / size / block / ghost / disabled / loading / loadingProps；未接入 icon、tag、href、type、form、任意原生属性或完整 Vue ButtonProps。对象默认确认主题跟随 danger / warning / success，info 和 default 使用 primary；确认加载为 confirmLoading 与配置 loading 的并集。禁用、加载或 null 同时保护点击和 confirmOnEnter。配置 onClick 接收原事件上下文并替换默认 Dialog 动作，鼠标/Enter 均只调用一次；没有 onClick 时确认仅输出 confirm，取消输出 cancel 和 close。配置对象不被组件改写。</p>
      <p class="demo-hint">各富内容模板提供 confirm / cancel / close 函数上下文，可用 let-confirm="confirm" 等绑定到库内 TButton 的 click；完整按钮模板和自定义底部不自动接管内部业务控件，调用上下文函数才执行 Dialog 动作。默认禁用/加载状态不能改变调用方模板内部的视觉，模板仍须自行绑定禁用；上下文函数保留动作保护。lazy / destroyOnClose 管理这些 Dialog 自有模板，关闭保留模式不重建正文；外部投影仍属于调用方。</p>
      <p class="demo-hint">full-screen 使用 vendor 全屏区块类，忽略普通 width 输入，头部与底部不收缩、主体自适应剩余高度并滚动；dialogStyle 中显式样式仍可覆盖全屏默认高度或宽度。返回普通模式会移除全屏默认布局样式并恢复 width。当前仍原位渲染，attach / showInAttachedElement / draggable、跨 Drawer / Popup / 原生弹层统一栈、退出动画及完整 SSR / 水合尚待后续。</p>
      <h2 class="docs-section__title" id="dialog-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TDialog" />
      </div>

      <docs-page-nav current="/dialog" />
    </div>
  `,
})
export class DialogDocs {}
