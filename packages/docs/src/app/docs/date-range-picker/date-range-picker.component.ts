import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoDateRangePickerBasic } from './demos/date-range-picker-basic';
import { DemoDateRangePickerOptions } from './demos/date-range-picker-options';
import { DemoDateRangePickerPresets } from './demos/date-range-picker-presets';
import { DemoDateRangePickerState } from './demos/date-range-picker-state';

@Component({
  selector: 'date-range-picker-docs',
  imports: [
    ApiTable,
    DemoBlock,
    PageNav,
    DemoDateRangePickerBasic,
    DemoDateRangePickerOptions,
    DemoDateRangePickerPresets,
    DemoDateRangePickerState,
  ],
  template: `
    <div class="docs-page">
      <h1 class="docs-page__title">日期范围 DateRangePicker</h1>
      <p class="docs-page__lead">
        日期范围选择器并排展示两个月，先点开始日期、再点结束日期：支持自定义回传格式（格式串 / 时间戳 / Date）、
        显示格式、一周起始日、禁用日期、可选范围限制、预设范围、手动输入、自定义分隔符、标签提示、清空、禁用与三种尺寸。
        悬停预览、时间选择与年份/月份模式在后续版本补齐。
      </p>

      <docs-demo id="date-range-picker-basic" title="基础用法" description="value 是 [开始, 结束] 数组；两次点击后 change 抛出 { value, trigger } 并收起面板。">
        <demo-date-range-picker-basic />
      </docs-demo>

      <docs-demo id="date-range-picker-options" title="禁用与尺寸" description="disableDate 支持函数与日期数组；size 支持 small / medium / large。">
        <demo-date-range-picker-options />
      </docs-demo>

      <docs-demo id="date-range-picker-presets" title="预设与手动输入" description="presets 提供快捷范围；allowInput 可直接输入，separator 自定义分隔符。">
        <demo-date-range-picker-presets />
      </docs-demo>

      <docs-demo id="date-range-picker-state" title="范围限制与状态" description="range 限定可选日期；label / tips / status 控制文案与校验态；borderless / readonly 控制外观。">
        <demo-date-range-picker-state />
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
