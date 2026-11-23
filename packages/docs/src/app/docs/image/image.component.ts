import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoImageBase } from './demos/image-base';
import { DemoImageFit } from './demos/image-fit';
import { DemoImagePreview } from './demos/image-preview';

@Component({
  selector: 'image-docs',
  imports: [ApiTable, DemoBlock, PageNav, DemoImageBase, DemoImageFit, DemoImagePreview],
  template: `
    <article class="docs-page">
      <h1 class="docs-page__title">图片 Image</h1>
      <p class="docs-page__lead">
        图片用于展示图像内容，支持填充方式、占位、加载与失败状态、浮层内容，以及相册样式；地址可以是字符串或
        <code>File</code>，后者会自动创建预览地址。
      </p>

      <docs-demo
        id="image-base"
        title="基础用法"
        description="src 传入图片地址，shape 控制外框形状，gallery 叠加相册阴影；加载失败时 fallback 会作为备用地址。"
      >
        <demo-image-base />
      </docs-demo>

      <docs-demo
        id="image-fit"
        title="填充方式"
        description="fit 对齐 CSS object-fit，position 对齐 object-position，两者共同决定图片在容器里的呈现区域。"
      >
        <demo-image-fit />
      </docs-demo>

      <docs-demo
        id="image-preview"
        title="点击预览"
        description="图片本身不处理点击，原生 click 会冒泡到宿主元素，因此直接在外层监听 (click) 打开 t-image-viewer 即可。"
      >
        <demo-image-preview />
      </docs-demo>

      <h2 class="docs-section__title" id="image-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TImage" />
      </div>

      <docs-page-nav current="/image" />
    </article>
  `,
})
export class ImageDocs {}
