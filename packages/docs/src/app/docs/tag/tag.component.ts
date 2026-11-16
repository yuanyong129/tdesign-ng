import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoTagBasic } from './demos/tag-basic';
import { DemoTagClosable } from './demos/tag-closable';
import { DemoTagColor } from './demos/tag-color';
import { DemoTagShape } from './demos/tag-shape';
import { DemoTagVariant } from './demos/tag-variant';

@Component({
  selector: 'tag-docs',
  imports: [ApiTable, DemoBlock, PageNav, DemoTagBasic, DemoTagVariant, DemoTagShape, DemoTagClosable, DemoTagColor],
  template: `
    <div class="docs-page">
      <h1 class="docs-page__title">标签 Tag</h1>
      <p class="docs-page__lead">
        标签用于标记与分类，支持主题、变体、形状、尺寸与自定义颜色。
      </p>

      <docs-demo id="tag-basic" title="基础用法" description="theme 决定底色，默认变体是 dark。">
        <demo-tag-basic />
      </docs-demo>

      <docs-demo id="tag-variant" title="变体" description="dark / light / outline / light-outline 四种填充方式。">
        <demo-tag-variant />
      </docs-demo>

      <docs-demo id="tag-shape" title="形状与尺寸" description="shape 支持 square / round / mark，maxWidth 超出省略。">
        <demo-tag-shape />
      </docs-demo>

      <docs-demo id="tag-closable" title="可关闭" description="closable 显示关闭图标，关闭时触发 (close)。">
        <demo-tag-closable />
      </docs-demo>

      <docs-demo id="tag-color" title="自定义颜色" description="color 会按亮度自动选择文字颜色。">
        <demo-tag-color />
      </docs-demo>

      <h2 class="docs-section__title" id="tag-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TTag" />
      </div>

      <docs-page-nav current="/tag" />
    </div>
  `,
})
export class TagDocs {}
