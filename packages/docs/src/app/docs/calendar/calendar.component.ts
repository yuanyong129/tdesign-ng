import { Component } from '@angular/core';

import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';

import { DemoCalendarBase } from './demos/calendar-base';
import { DemoCalendarControlled } from './demos/calendar-controlled';
import { DemoCalendarCustom } from './demos/calendar-custom';

@Component({
  selector: 'calendar-docs',
  imports: [ApiTable, DemoBlock, PageNav, DemoCalendarBase, DemoCalendarControlled, DemoCalendarCustom],
  template: `
    <article class="docs-page">
      <h1 class="docs-page__title">日历 Calendar</h1>
      <p class="docs-page__lead">
        日历用于按日期组织信息，支持月视图与年视图、多选、日期范围、自定义单元格与控制区配置。
      </p>

      <docs-demo
        id="calendar-base"
        title="基础日历"
        description="默认展示当前月份的月视图并选中今天，点击单元格即可切换选中日期，cellClick 会返回被点击的单元格信息。"
      >
        <demo-calendar-base />
      </docs-demo>

      <docs-demo
        id="calendar-controlled"
        title="受控的日历"
        description="value 受控时由使用方决定选中日期，monthChange 会返回当前展示的年月，卡片风格会隐藏「隐藏周末」和「今天」按钮。"
      >
        <demo-calendar-controlled />
      </docs-demo>

      <docs-demo
        id="calendar-custom"
        title="年视图与自定义单元格"
        description="通过 mode 在月视图与年视图之间切换，通过 cell 传入模板即可自定义每个单元格的内容，controllerChange 返回控制区的当前配置。"
      >
        <demo-calendar-custom />
      </docs-demo>

      <h2 class="docs-section__title" id="calendar-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TCalendar" />
      </div>

      <docs-page-nav current="/calendar" />
    </article>
  `,
})
export class CalendarDocs {}
