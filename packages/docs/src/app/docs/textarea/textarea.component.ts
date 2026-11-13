import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoTextareaAutosize } from './demos/textarea-autosize';
import { DemoTextareaBasic } from './demos/textarea-basic';
import { DemoTextareaDisabled } from './demos/textarea-disabled';
import { DemoTextareaLimit } from './demos/textarea-limit';
import { DemoTextareaStatus } from './demos/textarea-status';

@Component({
  selector: 'textarea-docs',
  imports: [
    ApiTable,
    DemoBlock,
    PageNav,
    DemoTextareaBasic,
    DemoTextareaAutosize,
    DemoTextareaStatus,
    DemoTextareaLimit,
    DemoTextareaDisabled,
  ],
  template: `
    <div class="docs-page">
      <h1 class="docs-page__title">文本域 Textarea</h1>
      <p class="docs-page__lead">
        文本域用于多行文本输入，支持自动撑高、字数限制与状态提示。
      </p>

      <docs-demo id="textarea-basic" title="基础文本域" description="通过 [(value)] 双向绑定，默认固定高度、可手动拉伸。">
        <demo-textarea-basic />
      </docs-demo>

      <docs-demo id="textarea-autosize" title="自动撑高" description="autosize 传 { minRows, maxRows } 控制高度范围，超出后出现滚动条。">
        <demo-textarea-autosize />
      </docs-demo>

      <docs-demo id="textarea-status" title="状态与提示" description="status 与 tips 的组合，用法与输入框一致。">
        <demo-textarea-status />
      </docs-demo>

      <docs-demo id="textarea-limit" title="字数限制" description="设置 maxcharacter 后，下方显示字数统计并超出截断。">
        <demo-textarea-limit />
      </docs-demo>

      <docs-demo id="textarea-disabled" title="禁用与只读" description="disabled 不可交互；readonly 可选中复制但不可修改。">
        <demo-textarea-disabled />
      </docs-demo>

      <h2 class="docs-section__title" id="textarea-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TTextarea" />
      </div>

      <docs-page-nav current="/textarea" />
    </div>
  `,
})
export class TextareaDocs {}
