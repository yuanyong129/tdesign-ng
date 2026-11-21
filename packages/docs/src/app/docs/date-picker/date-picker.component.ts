import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoDatePickerBasic } from './demos/date-picker-basic';
import { DemoDatePickerDisabled } from './demos/date-picker-disabled';
import { DemoDatePickerOptions } from './demos/date-picker-options';
import { DemoDatePickerPresets } from './demos/date-picker-presets';

@Component({
  selector: 'date-picker-docs',
  imports: [
    ApiTable,
    DemoBlock,
    PageNav,
    DemoDatePickerBasic,
    DemoDatePickerOptions,
    DemoDatePickerPresets,
    DemoDatePickerDisabled,
  ],
  template: `
    <div class="docs-page">
      <h1 class="docs-page__title">日期选择器 DatePicker</h1>
      <p class="docs-page__lead">
        日期选择器用日历面板选择单个日期：支持自定义回传格式（格式串 / 时间戳 / Date）、显示格式、
        一周起始日、禁用日期、预设日期、手动输入、清空、禁用与三种尺寸。范围选择、时间选择与年份/月份模式在后续版本补齐。
      </p>

      <docs-demo id="date-picker-basic" title="基础用法" description="value 控制选中日期，change 抛出 { value, trigger }；选中后自动收起面板。">
        <demo-date-picker-basic />
      </docs-demo>

      <docs-demo id="date-picker-options" title="更多配置" description="clearable 清空、size 尺寸、disabled 禁用；format 控制显示格式，valueType 控制回传格式。">
        <demo-date-picker-options />
      </docs-demo>

      <docs-demo id="date-picker-presets" title="预设与手动输入" description="presets 提供快捷日期，presetsPlacement 控制位置；allowInput 可直接输入，panelActiveDate 指定初始年月。">
        <demo-date-picker-presets />
      </docs-demo>

      <docs-demo id="date-picker-disabled" title="禁用日期" description="disableDate 支持函数、日期数组与范围对象（from / to / before / after）。">
        <demo-date-picker-disabled />
      </docs-demo>

      <h2 class="docs-section__title" id="date-picker-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TDatePicker" />
      </div>

      <docs-page-nav current="/date-picker" />
    </div>
  `,
})
export class DatePickerDocs {}
