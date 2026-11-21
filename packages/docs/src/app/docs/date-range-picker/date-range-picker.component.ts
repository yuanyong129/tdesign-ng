import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoDateRangePickerBasic } from './demos/date-range-picker-basic';
import { DemoDateRangePickerOptions } from './demos/date-range-picker-options';

@Component({
  selector: 'date-range-picker-docs',
  imports: [ApiTable, DemoBlock, PageNav, DemoDateRangePickerBasic, DemoDateRangePickerOptions],
  template: `
    <div class="docs-page">
      <h1 class="docs-page__title">日期范围 DateRangePicker</h1>
      <p class="docs-page__lead">
        日期范围选择器并排展示两个月，先点开始日期、再点结束日期：支持自定义回传格式（格式串 / 时间戳 / Date）、
        显示格式、一周起始日、禁用日期、清空、禁用与三种尺寸。范围悬停高亮、时间选择与预设日期在后续版本补齐。
      </p>

      <docs-demo id="date-range-picker-basic" title="基础用法" description="value 是 [开始, 结束] 数组；两次点击后 change 抛出 { value, trigger } 并收起面板。">
        <demo-date-range-picker-basic />
      </docs-demo>

      <docs-demo id="date-range-picker-options" title="禁用与尺寸" description="disableDate 支持函数与日期数组；size 支持 small / medium / large。">
        <demo-date-range-picker-options />
      </docs-demo>

      <h2 class="docs-section__title" id="date-range-picker-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TDateRangePicker" />
      </div>

      <docs-page-nav current="/date-range-picker" />
    </div>
  `,
})
export class DateRangePickerDocs {}
