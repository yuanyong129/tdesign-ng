import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoAutoCompleteBasic } from './demos/auto-complete-basic';
import { DemoAutoCompleteCustomOption } from './demos/auto-complete-custom-option';
import { DemoAutoCompleteRemote } from './demos/auto-complete-remote';
import { DemoAutoCompleteOptions } from './demos/auto-complete-options';

@Component({
  selector: 'auto-complete-docs',
  imports: [
    ApiTable,
    DemoBlock,
    PageNav,
    DemoAutoCompleteBasic,
    DemoAutoCompleteCustomOption,
    DemoAutoCompleteRemote,
    DemoAutoCompleteOptions,
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

      <docs-demo id="auto-complete-options" title="输入、弹层配置与状态" description="输入配置限制用户键入；选择候选项可写入完整文本。value 支持受控拒绝，defaultValue 仅初始化，表单支持失焦提交与 reset。自定义触发器支持方向键和 Enter，Esc 关闭面板。">
        <demo-auto-complete-options />
      </docs-demo>
      <p class="demo-hint">inputProps 使用 InputOptions 白名单，支持原生属性、长度限制及焦点/键盘/组合输入/onChange 回调；只用于内置 Input，不接收完整 Vue InputProps。disabled / readonly 与显式及表单状态取并集。popupProps 支持当前 PopupOptions 的位置、类名、箭头、层级、禁用和销毁等字段，trigger、delay、visible 和任意挂载配置不接收；输入和焦点的即时反馈由组件管理。popupProps.disabled 只关闭联想，仍允许输入。filter 返回 Promise 时沿用上游按真值保留选项的行为，不是异步筛选；远程请求请在 valueChange 中取数并更新 options，自行处理取消和乱序。textareaProps 仍未实现；自定义触发器负责自己的内容和无障碍标签。</p>

      <h2 class="docs-section__title" id="auto-complete-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TAutoComplete" />
      </div>

      <docs-page-nav current="/auto-complete" />
    </div>
  `,
})
export class AutoCompleteDocs {}
