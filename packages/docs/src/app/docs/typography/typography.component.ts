import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoTypographyBase } from './demos/typography-base';
import { DemoTypographyParagraph } from './demos/typography-paragraph';
import { DemoTypographySlot } from './demos/typography-slot';
import { DemoTypographyTitle } from './demos/typography-title';

@Component({
  selector: 'typography-docs',
  imports: [ApiTable, DemoBlock, PageNav, DemoTypographyBase, DemoTypographyParagraph, DemoTypographySlot, DemoTypographyTitle],
  template: `
    <article class="docs-page">
      <h1 class="docs-page__title">排版 Typography</h1>
      <p class="docs-page__lead">
        排版组件用统一的视觉规范呈现文本、标题与段落：t-text 负责行内文本，t-title 负责 h1 ~ h6 标题，t-paragraph 负责段落。
      </p>

      <docs-demo
        id="typography-base"
        title="文本与装饰"
        description="t-text 支持加粗、斜体、下划线、删除线、代码、键盘、标记等装饰属性，也可以设置主题色与禁用态。"
      >
        <demo-typography-base />
      </docs-demo>

      <docs-demo
        id="typography-title"
        title="标题"
        description="t-title 通过 level 渲染 h1 ~ h6，字号与上下间距随层级递减。"
      >
        <demo-typography-title />
      </docs-demo>

      <docs-demo
        id="typography-paragraph"
        title="段落与省略"
        description="t-paragraph 渲染段落，ellipsis 传 true 时单行截断，传 { row: 2 } 时按行数截断。"
      >
        <demo-typography-paragraph />
      </docs-demo>

      <docs-demo
        id="typography-slot"
        title="富文本内容"
        description="content 同时接受字符串与 TemplateRef，模板内容里可以继续放组件。"
      >
        <demo-typography-slot />
      </docs-demo>

      <h2 class="docs-section__title" id="typography-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TText" />
      </div>
      <div class="api-table__scroll">
        <api-table component="TTitle" />
      </div>
      <div class="api-table__scroll">
        <api-table component="TParagraph" />
      </div>

      <docs-page-nav current="/typography" />
    </article>
  `,
})
export class TypographyDocs {}
