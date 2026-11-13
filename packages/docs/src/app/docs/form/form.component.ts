import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoFormBasic } from './demos/form-basic';
import { DemoFormDisabled } from './demos/form-disabled';
import { DemoFormInline } from './demos/form-inline';
import { DemoFormLabel } from './demos/form-label';
import { DemoFormRules } from './demos/form-rules';
import { DemoFormValidator } from './demos/form-validator';

@Component({
  selector: 'form-docs',
  imports: [
    ApiTable,
    DemoBlock,
    PageNav,
    DemoFormBasic,
    DemoFormInline,
    DemoFormRules,
    DemoFormLabel,
    DemoFormDisabled,
    DemoFormValidator,
  ],
  template: `
    <div class="docs-page">
      <h1 class="docs-page__title">表单 Form</h1>
      <p class="docs-page__lead">
        表单用于收集与校验一组输入，t-form-item 负责标签、帮助文字与校验提示，规则语义与 TDesign 保持一致。
      </p>

      <docs-demo
        id="form-basic"
        title="基础用法"
        description="每个字段包在 t-form-item 里，用 name 匹配校验规则与取值。"
      >
        <demo-form-basic />
      </docs-demo>

      <docs-demo id="form-inline" title="行内表单" description="layout=&quot;inline&quot; 让表单项横向排列。">
        <demo-form-inline />
      </docs-demo>

      <docs-demo
        id="form-rules"
        title="校验规则"
        description="rules 支持 required、type、min/max、pattern、enum 与自定义 validator，提交时统一校验。"
      >
        <demo-form-rules />
      </docs-demo>

      <docs-demo
        id="form-label"
        title="标签配置"
        description="labelAlign 控制对齐方式，labelWidth 控制宽度，colon 在标签后加冒号。"
      >
        <demo-form-label />
      </docs-demo>

      <docs-demo id="form-disabled" title="整体禁用" description="t-form 的 disabled 会同步禁用内部所有控件。">
        <demo-form-disabled />
      </docs-demo>

      <docs-demo
        id="form-validator"
        title="自定义校验与 warning"
        description="validator 可以返回 warning 级结果，配合 submitWithWarningMessage 决定是否放行提交。"
      >
        <demo-form-validator />
      </docs-demo>

      <h2 class="docs-section__title" id="form-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TForm" />
      </div>
      <div class="api-table__scroll">
        <api-table component="TFormItem" />
      </div>

      <docs-page-nav current="/form" />
    </div>
  `,
})
export class FormDocs {}
