import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoSelectInputBasic } from './demos/select-input-basic';
import { DemoSelectInputPanel } from './demos/select-input-panel';
import { DemoSelectInputTag } from './demos/select-input-tag';
import { DemoSelectInputOptions } from './demos/select-input-options';

@Component({
  selector: 'select-input-docs',
  imports: [ApiTable, DemoBlock, PageNav, DemoSelectInputBasic, DemoSelectInputTag, DemoSelectInputPanel, DemoSelectInputOptions],
  template: `
    <article class="docs-page">
      <h1 class="docs-page__title">选择器输入 SelectInput</h1>
      <p class="docs-page__lead">
        选择器输入框把「可编辑输入 + 标签回显 + 下拉面板」拆成可复用的组合基座：单选时回显一个值、多选时回显一组标签，
        面板通过 panel 插槽由使用方提供，弹层、清空、折叠、禁用、只读、尺寸、状态与提示都由组件统一处理。
        可用于构建带自定义面板的选择器。
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

      <docs-demo id="select-input-options" title="输入配置与多选状态" description="inputProps 接入原生编辑区；tagInputProps 仅作用于多选，支持嵌套输入/标签配置及回调。IME 结束后统一限制，受控父级可拒绝修改，CVA 支持失焦提交与 reset。">
        <demo-select-input-options />
      </docs-demo>
      <p class="demo-hint">inputProps 采用 InputOptions 白名单，支持原生属性、长度限制、焦点/键盘/组合输入及 onChange；不接收 value、format、任意 DOM 属性或完整 InputProps。多选的 tagInputProps.inputProps 覆盖共享配置同名键，禁用和只读取并集；tagInputProps.tagProps 是默认标签配置，顶层 tagProps 同名键优先。tagInputProps 另支持 disabled、readonly、onInputChange、onChange；不支持自动创建标签、排序或完整 TagInputProps。选择值、输入文本和显隐分别由 value、inputValue、popupVisible 管理；defaultInputValue/defaultPopupVisible 仅初始化。多选关闭面板时 reserveKeyword=false 清空关键字，true 保留。mouseenter/leave 使用宿主原生 MouseEvent，范围包含提示区；paste 输出一次上下文。不要同时绑定 value 和 Angular 表单。</p>

      <h2 class="docs-section__title" id="select-input-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TSelectInput" />
      </div>

      <docs-page-nav current="/select-input" />
    </article>
  `,
})
export class SelectInputDocs {}
