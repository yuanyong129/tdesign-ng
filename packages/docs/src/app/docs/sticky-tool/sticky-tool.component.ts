import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoStickyToolBase } from './demos/sticky-tool-base';
import { DemoStickyToolPlacement } from './demos/sticky-tool-placement';
import { DemoStickyToolShape } from './demos/sticky-tool-shape';
import { DemoStickyToolPopupProps } from './demos/sticky-tool-popup-props';

@Component({
  selector: 'sticky-tool-docs',
  imports: [
    ApiTable,
    DemoBlock,
    PageNav,
    DemoStickyToolBase,
    DemoStickyToolPlacement,
    DemoStickyToolShape,
    DemoStickyToolPopupProps,
  ],
  template: `
    <article class="docs-page">
      <h1 class="docs-page__title">侧边悬浮 StickyTool</h1>
      <p class="docs-page__lead">把常用入口固定在页面侧边，悬浮或点击子项时弹出内容。</p>

      <docs-demo
        id="sticky-tool-base"
        title="基础用法"
        description="list 提供子项，popup 决定弹层内容，trigger 决定悬浮还是点击触发。"
      >
        <demo-sticky-tool-base />
      </docs-demo>

      <docs-demo
        id="sticky-tool-shape"
        title="形状与紧凑模式"
        description="type 为 compact 时只显示图标，shape 控制圆角，width 控制整体宽度。"
      >
        <demo-sticky-tool-shape />
      </docs-demo>

      <docs-demo
        id="sticky-tool-placement"
        title="位置与偏移"
        description="placement 指定停靠方向，offset 在默认偏移之上做增量。"
      >
        <demo-sticky-tool-placement />
      </docs-demo>

      <docs-demo id="sticky-tool-popup-props" title="弹层配置" description="整组 popupProps 作为默认配置，单项 popupProps 覆盖同名值；子项显式 trigger 优先。自定义内层类名与组件语义类合并。">
        <demo-sticky-tool-popup-props />
      </docs-demo>

      <h2 class="docs-section__title" id="sticky-tool-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TStickyTool" />
      </div>

      <docs-page-nav current="/sticky-tool" />
    </article>
  `,
})
export class StickyToolDocs {}
