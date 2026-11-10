import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoSpaceAlign } from './demos/space-align';
import { DemoSpaceBreakLine } from './demos/space-break-line';
import { DemoSpaceHorizontal } from './demos/space-horizontal';
import { DemoSeparator } from './demos/space-separator';
import { DemoSpaceSize } from './demos/space-size';
import { DemoSpaceVertical } from './demos/space-vertical';

@Component({
  selector: 'space-docs',
  imports: [
    ApiTable,
    DemoBlock,
    PageNav,
    DemoSpaceAlign,
    DemoSpaceBreakLine,
    DemoSpaceHorizontal,
    DemoSeparator,
    DemoSpaceSize,
    DemoSpaceVertical,
  ],
  template: `
    <article class="docs-page">
      <h1 class="docs-page__title">间距 Space</h1>
      <p class="docs-page__lead">间距组件用于设置相邻组件之间的间隔。</p>

      <docs-demo
        id="space-horizontal"
        title="水平间距"
        description="默认方向为 horizontal，size 支持 small / medium / large 预设值，也支持数字或 CSS 长度。"
      >
        <demo-space-horizontal />
      </docs-demo>

      <docs-demo id="space-size" title="不同间距大小" description="size 可以是预设值、数字（像素）或 CSS 长度。">
        <demo-space-size />
      </docs-demo>

      <docs-demo id="space-vertical" title="垂直间距" description="把 direction 设为 vertical，元素会纵向排列。">
        <demo-space-vertical />
      </docs-demo>

      <docs-demo id="space-separator" title="分隔符" description="separator 目前支持字符串。">
        <demo-space-separator />
      </docs-demo>

      <docs-demo
        id="space-break-line"
        title="自动换行"
        description="设置 breakLine 后，容器宽度不足时子元素自动换行。"
      >
        <demo-space-break-line />
      </docs-demo>

      <docs-demo id="space-align" title="对齐方式" description="通过 align 控制交叉轴的对齐：start、center、end、baseline。">
        <demo-space-align />
      </docs-demo>

      <h2 class="docs-section__title" id="space-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TSpace" />
      </div>

      <docs-page-nav current="/space" />
    </article>
  `,
})
export class SpaceDocs {}
