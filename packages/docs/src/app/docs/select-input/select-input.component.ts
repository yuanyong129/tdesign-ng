import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoSelectInputBasic } from './demos/select-input-basic';
import { DemoSelectInputPanel } from './demos/select-input-panel';
import { DemoSelectInputTag } from './demos/select-input-tag';

@Component({
  selector: 'select-input-docs',
  imports: [ApiTable, DemoBlock, PageNav, DemoSelectInputBasic, DemoSelectInputTag, DemoSelectInputPanel],
  template: `
    <article class="docs-page">
      <h1 class="docs-page__title">选择器输入 SelectInput</h1>
      <p class="docs-page__lead">
        选择器输入框把「可编辑输入 + 标签回显 + 下拉面板」拆成可复用的组合基座：单选时回显一个值、多选时回显一组标签，
        面板通过 panel 插槽由使用方提供，弹层、清空、折叠、禁用、只读、尺寸、状态与提示都由组件统一处理。
        t-select / t-tree-select / t-cascader 都复用它。
      </p>

      <docs-demo
        id="select-input-basic"
        title="基础用法"
        description="value 控制回显值，inputValue 受控输入文本；allowInput 打开编辑、clearable 打开清空，回车抛出 enter。"
      >
        <demo-select-input-basic />
      </docs-demo>

      <docs-demo
        id="select-input-tag"
        title="标签回显"
        description="multiple 把数组值渲染成标签，minCollapsedNum 折叠超出部分，tagChange 抛出 { value, trigger, index, item }；readonly 与 disabled 只回显不可操作。"
      >
        <demo-select-input-tag />
      </docs-demo>

      <docs-demo
        id="select-input-panel"
        title="面板插槽"
        description="panel 传入模板即接管下拉内容，popupVisible 可受控；示例用 t-tag 拼出选择面板，输入关键字实时过滤。"
      >
        <demo-select-input-panel />
      </docs-demo>

      <h2 class="docs-section__title" id="select-input-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TSelectInput" />
      </div>

      <docs-page-nav current="/select-input" />
    </article>
  `,
})
export class SelectInputDocs {}
