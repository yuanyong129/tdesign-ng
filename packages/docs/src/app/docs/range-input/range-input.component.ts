import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoRangeInputBasic } from './demos/range-input-basic';
import { DemoRangeInputAdvanced } from './demos/range-input-advanced';
import { DemoRangeInputDisabled } from './demos/range-input-disabled';

@Component({
  selector: 'range-input-docs',
  imports: [ApiTable, DemoBlock, PageNav, DemoRangeInputBasic, DemoRangeInputAdvanced, DemoRangeInputDisabled],
  template: `
    <div class="docs-page">
      <h1 class="docs-page__title">范围输入框 RangeInput</h1>
      <p class="docs-page__lead">
        范围输入框用于录入一组区间值，左右两个输入框共享一个外框，支持分隔符、前后缀、清除、状态与尺寸设置。
      </p>

      <docs-demo
        id="range-input-basic"
        title="基础用法"
        description="value 为长度 2 的数组，支持双向绑定；separator 控制两个输入框之间的分隔符，placeholder 可传数组分别设置。"
      >
        <demo-range-input-basic />
      </docs-demo>

      <docs-demo
        id="range-input-advanced"
        title="前后缀与状态"
        description="prefixIcon、label、suffix 可以是文本也可以是模板；tips 展示辅助说明；status 与 size 控制外观。"
      >
        <demo-range-input-advanced />
      </docs-demo>

      <docs-demo
        id="range-input-disabled"
        title="禁用与清除"
        description="disabled 传布尔值时整体禁用，传数组时可按左右输入框分别禁用；clearable 开启后鼠标移入显示清除图标，borderless 为无边框风格。"
      >
        <demo-range-input-disabled />
      </docs-demo>

      <h2 class="docs-section__title" id="range-input-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TRangeInput" />
      </div>

      <docs-page-nav current="/range-input" />
    </div>
  `,
})
export class RangeInputDocs {}
