import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoImageViewerBase } from './demos/image-viewer-base';
import { DemoImageViewerKeyboard } from './demos/image-viewer-keyboard';
import { DemoImageViewerTools } from './demos/image-viewer-tools';

@Component({
  selector: 'image-viewer-docs',
  imports: [ApiTable, DemoBlock, PageNav, DemoImageViewerBase, DemoImageViewerTools, DemoImageViewerKeyboard],
  template: `
    <article class="docs-page">
      <h1 class="docs-page__title">图片预览 ImageViewer</h1>
      <p class="docs-page__lead">
        图片预览用于全屏查看图片，支持多图切换、缩放、旋转、镜像、拖拽与键盘操作。默认渲染在
        <code>modal</code> 形态的全屏遮罩里，也可以通过 <code>mode="modeless"</code> 交给对话框承载。
      </p>

      <docs-demo
        id="image-viewer-base"
        title="基础用法"
        description="images 传入图片地址或 File，visible 控制显隐；默认还会渲染一个 40px 的触发器缩略图，hover 后点击即可打开。"
      >
        <demo-image-viewer-base />
      </docs-demo>

      <docs-demo
        id="image-viewer-tools"
        title="工具条与缩放"
        description="顶部工具条提供镜像、旋转、缩小、放大、原始大小与下载；imageScale 可以调整缩放范围与步长，title 替换默认的「序号/总数」。"
      >
        <demo-image-viewer-tools />
      </docs-demo>

      <docs-demo
        id="image-viewer-keyboard"
        title="键盘操作"
        description="打开时绑定键盘监听，关闭立即解绑：左右方向键切换图片，上下方向键缩放，Esc 关闭（closeOnEscKeydown 为 false 时不响应）。"
      >
        <demo-image-viewer-keyboard />
      </docs-demo>

      <h2 class="docs-section__title" id="image-viewer-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TImageViewer" />
      </div>

      <docs-page-nav current="/image-viewer" />
    </article>
  `,
})
export class ImageViewerDocs {}
