import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoTimePickerBasic } from './demos/time-picker-basic';
import { DemoTimePickerOptions } from './demos/time-picker-options';

@Component({
  selector: 'time-picker-docs',
  imports: [ApiTable, DemoBlock, PageNav, DemoTimePickerBasic, DemoTimePickerOptions],
  template: `
    <div class="docs-page">
      <h1 class="docs-page__title">时间选择器 TimePicker</h1>
      <p class="docs-page__lead">
        时间选择器用时 / 分 / 秒三列选择时间：支持自定义格式（HH / mm / ss）、列步长、清空、禁用与三种尺寸。
        面板里选中只更新草稿，点「确定」后才提交；「此刻」快速填入当前时间。禁用时间、预设与手动输入在后续版本补齐。
      </p>

      <docs-demo id="time-picker-basic" title="基础用法" description="value 控制选中时间，change 在点「确定」后抛出 { value, trigger }。">
        <demo-time-picker-basic />
      </docs-demo>

      <docs-demo id="time-picker-options" title="格式与步长" description="format 控制列数，steps 控制每列步长；另含 clearable / disabled / size。">
        <demo-time-picker-options />
      </docs-demo>

      <h2 class="docs-section__title" id="time-picker-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TTimePicker" />
      </div>

      <docs-page-nav current="/time-picker" />
    </div>
  `,
})
export class TimePickerDocs {}
