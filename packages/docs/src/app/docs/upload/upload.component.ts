import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoUploadBase } from './demos/upload-base';
import { DemoUploadDrag } from './demos/upload-drag';
import { DemoUploadList } from './demos/upload-list';

@Component({
  selector: 'upload-docs',
  imports: [ApiTable, DemoBlock, PageNav, DemoUploadBase, DemoUploadDrag, DemoUploadList],
  template: `
    <article class="docs-page">
      <h1 class="docs-page__title">上传 Upload</h1>
      <p class="docs-page__lead">
        上传用于把本地文件发送到服务端。<code>action</code> 走内置的 XMLHttpRequest，需要自定义请求时改用
        <code>requestMethod</code>，两者取其一；进度、状态与列表都由组件内部维护，也可以通过
        <code>fileListDisplay</code> 完全接管。
      </p>

      <docs-demo
        id="upload-base"
        title="基础用法"
        description="选择文件后立即上传，accept 限制可选类型，max 限制数量，sizeLimit 限制单个文件大小；超限的文件不会进入列表。"
      >
        <demo-upload-base />
      </docs-demo>

      <docs-demo
        id="upload-drag"
        title="拖拽上传"
        description="draggable 把触发区换成拖拽区域，文件拖入时高亮，释放后取 dataTransfer 里的文件；同一组件同时支持点击选择。"
      >
        <demo-upload-drag />
      </docs-demo>

      <docs-demo
        id="upload-list"
        title="文件列表"
        description="autoUpload 为 false 时选中的文件先进入待上传状态，调用 uploadFiles 才开始上传；fileListDisplay 接管列表内容，可以自行排版。"
      >
        <demo-upload-list />
      </docs-demo>

      <h2 class="docs-section__title" id="upload-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TUpload" />
      </div>

      <docs-page-nav current="/upload" />
    </article>
  `,
})
export class UploadDocs {}
