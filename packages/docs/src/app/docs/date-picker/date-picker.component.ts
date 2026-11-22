import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoDatePickerBasic } from './demos/date-picker-basic';
import { DemoDatePickerDisabled } from './demos/date-picker-disabled';
import { DemoDatePickerOptions } from './demos/date-picker-options';
import { DemoDatePickerPresets } from './demos/date-picker-presets';
import { DemoDatePickerTime } from './demos/date-picker-time';
import { DemoDatePickerMode } from './demos/date-picker-mode';
import { DemoDatePickerQuarter } from './demos/date-picker-quarter';
import { DemoDatePickerRange } from './demos/date-picker-range';
import { DemoDatePickerRender } from './demos/date-picker-render';
import { DemoDatePickerWeek } from './demos/date-picker-week';

@Component({
  selector: 'date-picker-docs',
  imports: [
    ApiTable,
    DemoBlock,
    PageNav,
    DemoDatePickerBasic,
    DemoDatePickerOptions,
    DemoDatePickerPresets,
    DemoDatePickerTime,
    DemoDatePickerMode,
    DemoDatePickerWeek,
    DemoDatePickerQuarter,
  DemoDatePickerRange,
  DemoDatePickerRender,
    DemoDatePickerDisabled,
  ],
  template: `
    <div class="docs-page">
      <h1 class="docs-page__title">日期选择器 DatePicker</h1>
      <p class="docs-page__lead">
        日期选择器支持单日期、日期 + 时间，以及周 / 月份 / 季度 / 年份模式：自定义回传格式（格式串 / 时间戳 / Date）、显示格式、
        一周起始日、禁用日期、预设日期、手动输入、清空、禁用与三种尺寸。范围选择请使用 DateRangePicker。
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

      <docs-demo id="date-picker-time" title="日期 + 时间" description="enableTimePicker 显示时分秒列；needConfirm 默认 true，点「确定」才提交，false 时点日期立即提交。">
        <demo-date-picker-time />
      </docs-demo>

      <docs-demo id="date-picker-mode" title="月份与年份模式" description="mode=month 只选月份、回传 YYYY-MM；mode=year 只选年份、回传 YYYY。">
        <demo-date-picker-mode />
      </docs-demo>

            <docs-demo id="date-picker-week" title="周选择" description="mode=week 时每行代表一整周，首列为 ISO 周号，点击任意一天选中整周，回传 YYYY-[W]WW。">
        <demo-date-picker-week />
      </docs-demo>

      <docs-demo id="date-picker-quarter" title="季度选择" description="mode=quarter 时面板展示四个季度，选中后回传 YYYY-[Q]Q。">
        <demo-date-picker-quarter />
      </docs-demo>

      <docs-demo id="date-picker-render" title="自定义单元格与回显" description="cell 返回每个日期格的文案，valueDisplay 改写输入框回显。">
        <demo-date-picker-render />
      </docs-demo>

      <docs-demo id="date-picker-range" title="可选范围" description="range 传 [start, end] 限制可选窗口，或传函数按日期判断是否可选。">
        <demo-date-picker-range />
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



