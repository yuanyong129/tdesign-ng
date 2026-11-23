import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoInputNumberBasic } from './demos/input-number-basic';
import { DemoInputNumberAdvanced } from './demos/input-number-advanced';
import { DemoInputNumberDisabled } from './demos/input-number-disabled';

@Component({
  selector: 'input-number-docs',
  imports: [ApiTable, DemoBlock, PageNav, DemoInputNumberBasic, DemoInputNumberAdvanced, DemoInputNumberDisabled],
  template: `
    <div class="docs-page">
      <h1 class="docs-page__title">数字输入框 InputNumber</h1>
      <p class="docs-page__lead">
        数字输入框用于录入数字，可通过步进按钮或键盘上下键调整，支持范围限制、小数位、大数模式与格式化展示。
      </p>

      <docs-demo
        id="input-number-basic"
        title="基础用法"
        description="value 支持双向绑定；defaultValue 用于非受控场景；theme 控制步进按钮的排布。"
      >
        <demo-input-number-basic />
      </docs-demo>

      <docs-demo
        id="input-number-advanced"
        title="步长与小数位"
        description="step 控制步长，decimalPlaces 限制小数位，allowInputOverLimit 控制越界值是否保留，largeNumber 让大数按字符串精确运算。"
      >
        <demo-input-number-advanced />
      </docs-demo>

      <docs-demo
        id="input-number-disabled"
        title="禁用与状态"
        description="disabled 与 readonly 都不可编辑，值超出 min / max 时状态自动切换为 error，size 提供三档尺寸。"
      >
        <demo-input-number-disabled />
      </docs-demo>

      <h2 class="docs-section__title" id="input-number-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TInputNumber" />
      </div>

      <docs-page-nav current="/input-number" />
    </div>
  `,
})
export class InputNumberDocs {}
