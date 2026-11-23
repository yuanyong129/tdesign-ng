import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoGuideBase } from './demos/guide-base';
import { DemoGuideCustom } from './demos/guide-custom';
import { DemoGuideMode } from './demos/guide-mode';

@Component({
  selector: 'guide-docs',
  imports: [ApiTable, DemoBlock, PageNav, DemoGuideBase, DemoGuideMode, DemoGuideCustom],
  template: `
    <article class="docs-page">
      <h1 class="docs-page__title">引导 Guide</h1>
      <p class="docs-page__lead">
        引导用于分步介绍新功能。每一步定位到一个目标元素并高亮它，在旁边显示说明卡，用户可以上一步、下一步、跳过或完成整个引导。
      </p>

      <docs-demo
        id="guide-base"
        title="基础用法"
        description="用 element 指定目标元素的选择器，steps 描述每一步的标题与说明；current 控制当前步骤，-1 表示关闭引导。"
      >
        <demo-guide-base />
      </docs-demo>

      <docs-demo
        id="guide-mode"
        title="展示模式"
        description="mode 为 popup 时在目标元素旁显示气泡，为 dialog 时在页面中央显示对话框；单个步骤也可以用 mode 与 placement 覆盖全局设置。"
      >
        <demo-guide-mode />
      </docs-demo>

      <docs-demo
        id="guide-custom"
        title="自定义内容"
        description="content 用模板完全替换气泡内容，并可从上下文取得 current、total 与 next、prev、skip、finish 方法；highlightContent 可以替换默认的高亮区域。"
      >
        <demo-guide-custom />
      </docs-demo>

      <h2 class="docs-section__title" id="guide-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TGuide" />
      </div>

      <docs-page-nav current="/guide" />
    </article>
  `,
})
export class GuideDocs {}
