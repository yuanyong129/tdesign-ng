import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoCardBasic } from './demos/card-basic';
import { DemoCardCover } from './demos/card-cover';
import { DemoCardLoading } from './demos/card-loading';
import { DemoCardLoadingProps } from './demos/card-loading-props';
import { DemoCardLoadingContent } from './demos/card-loading-content';

@Component({
  selector: 'card-docs',
  imports: [ApiTable, DemoBlock, PageNav, DemoCardBasic, DemoCardCover, DemoCardLoading, DemoCardLoadingProps, DemoCardLoadingContent],
  template: `
    <article class="docs-page">
      <h1 class="docs-page__title">卡片 Card</h1>
      <p class="docs-page__lead">
        卡片用于承载信息，把标题、描述、操作与内容组织在一个可复用的容器里，常与列表、栅格等组件搭配使用。
      </p>

      <docs-demo
        id="card-basic"
        title="基础用法"
        description="用 title、subtitle、description 组织说明文字，actions 显示操作区，footer 承载底部内容，卡片主体由内容投影传入。"
      >
        <demo-card-basic />
      </docs-demo>

      <docs-demo
        id="card-cover"
        title="封面与头像"
        description="cover 传入图片地址或模板，头部支持 avatar 头像；theme 设为 poster2 时操作区会移到卡片底部。"
      >
        <demo-card-cover />
      </docs-demo>

      <docs-demo
        id="card-loading"
        title="加载状态"
        description="loading 为 true 时卡片主体显示加载中，头部与底部保持可见。"
      >
        <demo-card-loading />
      </docs-demo>

      <docs-demo id="card-loading-props" title="自定义加载配置" description="loadingProps 配置文字、尺寸、延迟、遮罩和全屏等属性；加载遮罩出现前后保留业务内容。">
        <demo-card-loading-props />
      </docs-demo>
      <docs-demo id="card-loading-content" title="加载模板与动态主体" description="使用 TButton 和 TInput 验证主体状态保留，自定义 loading 模板替换卡片可见内容，动态主体为空时不保留空白主体区。">
        <demo-card-loading-content />
      </docs-demo>
      <p class="demo-hint">loading=true 使用共享 TLoading 包裹主体，默认遮罩覆盖主体及其 padding，头部和底部保持可见。业务节点一直挂载，加载显隐和延迟不隐藏、重建或移动主体，输入草稿与正常加载切换时的焦点保留；遮罩不替代业务禁用和键盘管理。空主体在 loading=false 时隐藏主体区域，动态插入/删除元素和纯文字会重新识别；元素节点即使文字为空也算内容。</p>
      <p class="demo-hint">loading 也可传 TemplateRef，立即替换整张卡片的可见结构（包括头部、封面、主体和底部），宿主不再添加卡片自身样式类；正常区块常驻隐藏，恢复布尔状态时保留原业务实例。自定义模板的交互、焦点和高度由调用方管理，模板模式不应用 loadingProps 的 delay / fullscreen。模板被关闭或替换时销毁其视图。</p>
      <p class="demo-hint">CardLoadingOptions 支持原 LoadingOptions 字段及 indicator（布尔值、字符串或模板），text 支持模板，size 支持 CSS 尺寸。显式 loading 决定加载状态；不接收 attach、content 或 loading，避免替换卡片业务投影，Button 的 LoadingOptions 保持原白名单。content / default 使用 ng-content 映射；完整 SSR / 水合仍待单独验收。</p>

      <h2 class="docs-section__title" id="card-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TCard" />
      </div>

      <docs-page-nav current="/card" />
    </article>
  `,
})
export class CardDocs {}
