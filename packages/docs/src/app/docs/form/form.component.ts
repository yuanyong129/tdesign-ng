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
import { DemoFormLifecycle } from './demos/form-lifecycle';
import { DemoFormReadonly } from './demos/form-readonly';

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
    DemoFormLifecycle,
    DemoFormReadonly,
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

      <docs-demo id="form-lifecycle" title="重置、动态字段与异步校验" description="resetType 的 empty 清空字段，initial 恢复挂载初值；预先禁用的控件不会被表单解锁。异步校验按最新请求显示结果，提交等待期间重复提交无效。">
        <demo-form-lifecycle />
      </docs-demo>
      <p class="demo-hint">id 设置在原生 form 上，可供外部按钮的 form 属性引用。validateAll / validateField 返回字段结果；字段被编辑、重置、移除或销毁时，过期结果带 stale=true 并阻止提交。submit 仍只在校验放行后输出；reset 输出重置后的字段值。errorMessage 的统一文字同时作用于界面与返回结果。数值与对象的 empty 值为 null，字符串为空串、布尔为 false、数组为空数组。每个表单项当前管理首个 Angular 表单控件，复合字段请用单一 CVA。不要同时用外部 FormGroup.disable/enable 与 t-form.disabled 管理同一锁定周期。</p>

      <docs-demo id="form-readonly" title="表单只读" description="已有 readonly 能力的控件继承表单状态，与控件自身只读取并集；切换只读关闭选择弹层并阻止清空和移除，仍可聚焦和复制。">
        <demo-form-readonly />
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
