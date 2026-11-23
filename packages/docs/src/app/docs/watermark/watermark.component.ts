import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoWatermarkBase } from './demos/watermark-base';
import { DemoWatermarkMovable } from './demos/watermark-movable';
import { DemoWatermarkMulti } from './demos/watermark-multi';

@Component({
  selector: 'watermark-docs',
  imports: [ApiTable, DemoBlock, PageNav, DemoWatermarkBase, DemoWatermarkMovable, DemoWatermarkMulti],
  template: `
    <article class="docs-page">
      <h1 class="docs-page__title">水印 Watermark</h1>
      <p class="docs-page__lead">
        水印用于给页面或某个区域打上不可轻易去掉的标识。图案由 canvas 在运行时绘制成背景图再平铺，所以文字、字号、旋转角与透明度都通过属性控制。
        需要防止水印被删除时把 <code>removable</code> 设为 <code>false</code>。
      </p>

      <docs-demo
        id="watermark-base"
        title="基础用法"
        description="watermarkContent 描述要绘制的文字，width / height 是一个水印块的尺寸，x / y 是块之间的水平与垂直间距；投影内容由水印覆盖。"
      >
        <demo-watermark-base />
      </docs-demo>

      <docs-demo
        id="watermark-movable"
        title="水印移动"
        description="movable 为 true 时水印会按 moveInterval 的间隔换到随机位置，此时 x / y / rotate 不再生效。"
      >
        <demo-watermark-movable />
      </docs-demo>

      <docs-demo
        id="watermark-multi"
        title="多行内容"
        description="watermarkContent 传数组可以画多行文字，行距由 lineSpace 控制；数组里也可以混入图片（url），图片会按先后顺序竖向排布。"
      >
        <demo-watermark-multi />
      </docs-demo>

      <h2 class="docs-section__title" id="watermark-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TWatermark" />
      </div>

      <docs-page-nav current="/watermark" />
    </article>
  `,
})
export class WatermarkDocs {}
