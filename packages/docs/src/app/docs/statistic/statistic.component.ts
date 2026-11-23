import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoStatisticBase } from './demos/statistic-base';
import { DemoStatisticPrecision } from './demos/statistic-precision';
import { DemoStatisticTrend } from './demos/statistic-trend';

@Component({
  selector: 'statistic-docs',
  imports: [ApiTable, DemoBlock, PageNav, DemoStatisticBase, DemoStatisticPrecision, DemoStatisticTrend],
  template: `
    <article class="docs-page">
      <h1 class="docs-page__title">统计数值 Statistic</h1>
      <p class="docs-page__lead">
        统计数值用于突出展示关键指标，支持标题、单位、前后缀、小数位数与千分位分隔符，并可显示涨跌趋势。
      </p>

      <docs-demo id="statistic-base" title="基础用法" description="title 显示标题，value 为数值，unit 显示单位，prefix 显示数值前缀。">
        <demo-statistic-base />
      </docs-demo>

      <docs-demo id="statistic-precision" title="数值精度" description="decimalPlaces 控制小数位数，separator 传空字符串可关闭千分位，format 完全接管格式化。">
        <demo-statistic-precision />
      </docs-demo>

      <docs-demo id="statistic-trend" title="趋势与加载态" description="trend 渲染涨跌箭头，trendPlacement 控制箭头位置，color 改变数值颜色，loading 显示骨架屏。">
        <demo-statistic-trend />
      </docs-demo>

      <h2 class="docs-section__title" id="statistic-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TStatistic" />
      </div>

      <docs-page-nav current="/statistic" />
    </article>
  `,
})
export class StatisticDocs {}
