import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoAutoCompleteBasic } from './demos/auto-complete-basic';
import { DemoAutoCompleteCustomOption } from './demos/auto-complete-custom-option';
import { DemoAutoCompleteRemote } from './demos/auto-complete-remote';

@Component({
  selector: 'auto-complete-docs',
  imports: [
    ApiTable,
    DemoBlock,
    PageNav,
    DemoAutoCompleteBasic,
    DemoAutoCompleteCustomOption,
    DemoAutoCompleteRemote,
  ],
  template: `
    <div class="docs-page">
      <h1 class="docs-page__title">自动补全 AutoComplete</h1>
      <p class="docs-page__lead">
        自动补全在输入框下方展示联想面板：输入即按关键字过滤选项，上下键切换活动项，回车提交当前项，
        选项既可以来自本地数据源，也可以由远程请求返回。
      </p>

      <docs-demo
        id="auto-complete-basic"
        title="基础用法"
        description="用 options 声明联想数据，value 双向绑定输入值，输入即过滤。"
      >
        <demo-auto-complete-basic />
      </docs-demo>

      <docs-demo
        id="auto-complete-custom-option"
        title="自定义选项内容"
        description="选项的 label 传模板即可自定义内容，text 仍用于过滤与选中。"
      >
        <demo-auto-complete-custom-option />
      </docs-demo>

      <docs-demo
        id="auto-complete-remote"
        title="异步联想"
        description="远程联想：输入防抖后请求数据并写回 options，value 由页面受控。"
      >
        <demo-auto-complete-remote />
      </docs-demo>

      <h2 class="docs-section__title" id="auto-complete-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TAutoComplete" />
      </div>

      <docs-page-nav current="/auto-complete" />
    </div>
  `,
})
export class AutoCompleteDocs {}
