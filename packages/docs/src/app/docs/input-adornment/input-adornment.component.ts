import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoInputAdornmentBase } from './demos/input-adornment-base';
import { DemoInputAdornmentTemplate } from './demos/input-adornment-template';

@Component({
  selector: 'input-adornment-docs',
  imports: [ApiTable, DemoBlock, PageNav, DemoInputAdornmentBase, DemoInputAdornmentTemplate],
  template: `
    <article class="docs-page">
      <h1 class="docs-page__title">输入框前后缀 InputAdornment</h1>
      <p class="docs-page__lead">
        输入框前后缀用于在输入框两侧附加说明文字或操作控件，通常与 t-input 组合使用。
      </p>

      <docs-demo
        id="input-adornment-base"
        title="基础用法"
        description="prepend 渲染前缀，append 渲染后缀，传入字符串时自动包一层 __text。"
      >
        <demo-input-adornment-base />
      </docs-demo>

      <docs-demo
        id="input-adornment-template"
        title="前后缀使用模板"
        description="prepend、append 也可以传入模板，用来放置按钮、下拉选择等交互控件。"
      >
        <demo-input-adornment-template />
      </docs-demo>

      <h2 class="docs-section__title" id="input-adornment-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TInputAdornment" />
      </div>

      <docs-page-nav current="/input-adornment" />
    </article>
  `,
})
export class InputAdornmentDocs {}
