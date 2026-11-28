import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoLoadingBasic } from './demos/loading-basic';
import { DemoLoadingFullscreen } from './demos/loading-fullscreen';
import { DemoLoadingContent } from './demos/loading-content';

@Component({
  selector: 'loading-docs',
  imports: [ApiTable, DemoBlock, PageNav, DemoLoadingBasic, DemoLoadingFullscreen, DemoLoadingContent],
  template: `
    <div class="docs-page">
      <h1 class="docs-page__title">加载 Loading</h1>
      <p class="docs-page__lead">
        加载用于表示正在进行的异步操作：行内用 &lt;t-loading&gt; 组件，全屏用 TLoadingService 以服务方式调用。
      </p>

      <docs-demo id="loading-basic" title="基础用法" description="[loading] 控制显隐，text 显示提示文字。">
        <demo-loading-basic />
      </docs-demo>

      <docs-demo id="loading-fullscreen" title="全屏加载" description="服务式调用会挂到 body 并锁住背景滚动，支持 delay。">
        <demo-loading-fullscreen />
      </docs-demo>

      <docs-demo id="loading-content" title="内容包裹、自定义图标与挂载" description="默认投影或 content 作为业务内容常驻，加载时覆盖遮罩。indicator 支持模板、文本和布尔值，text 支持模板，attach 可以挂到指定区域。">
        <demo-loading-content />
      </docs-demo>
      <p class="demo-hint">content 支持字符串或模板，显式值（包括空串）优先于默认投影；投影一直保留，加载显隐和延迟不会重建业务节点。indicator=true 使用默认渐变环、false 隐藏，文本/模板自定义；text 也支持文本/模板，size 支持预设或 CSS 尺寸。showOverlay 在全屏、包裹和挂载模式生效。包裹区域使用 aria-busy，加载标识使用 status 语义；遮罩不替代业务控件的禁用和焦点管理。</p>
      <p class="demo-hint">无包裹内容或 fullscreen 时 attach 才生效，支持选择器、元素或函数；非法、缺失、未连接和跨文档目标回退本地显示，update() 可重新解析目标。局部挂载会临时添加 vendor 的 relative 类并按多实例引用计数恢复；已有定位和同名类保留。切换挂载点会重建加载标识，业务投影不重建。fullscreen 保持 fixed 语义及 body 滚动锁，祖先 transform 可能改变 fixed 的 CSS 包含块。服务使用 LoadingServiceOptions 扩展接收 attach / content / indicator；Button / Card 的 LoadingOptions 尚未接入这些字段。hideAll 只销毁本服务创建的实例，不删除页面组件式 Loading；延迟和滚动锁随 Angular 实例一并清理。完整 SSR / 水合及全局配置合并尚未验收。</p>

      <h2 class="docs-section__title" id="loading-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TLoading" />
      </div>

      <docs-page-nav current="/loading" />
    </div>
  `,
})
export class LoadingDocs {}
