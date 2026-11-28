import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoStatisticBase } from './demos/statistic-base';
import { DemoStatisticPrecision } from './demos/statistic-precision';
import { DemoStatisticTrend } from './demos/statistic-trend';
import { DemoStatisticAnimation } from './demos/statistic-animation';

@Component({
  selector: 'statistic-docs',
  imports: [ApiTable, DemoBlock, PageNav, DemoStatisticBase, DemoStatisticPrecision, DemoStatisticTrend, DemoStatisticAnimation],
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

      <docs-demo id="statistic-animation" title="数值动画" description="animation 配置起始值和毫秒时长，animationStart 自动播放；也可通过模板引用调用 start()，支持重播、负数与小数。">
        <demo-statistic-animation />
      </docs-demo>
      <p class="demo-hint">animation 为 {{ '{ valueFrom: number, duration: number }' }}，使用四次缓出曲线。配置了动画但未自动启动时，首次展示 valueFrom；start() 总是从配置起点重播。目标、配置或自动开关变化时取消旧动画；自动开启时从起点播放新目标，关闭时显示目标值。重复 start() 只保留最新一轮，销毁后调用无效。loading 只切换骨架展示，后台动画继续。未配置动画、起止相同、时长非正数/非有限数、起点或目标非有限、无 rAF 环境或系统减少动态效果时，start() 直接显示目标值。关闭自动播放和动态替换配置的取消行为是本库明确的生命周期约定，不复制上游旧 tween 残留行为。</p>
      <p class="demo-hint">动画中间值按 decimalPlaces 或目标的小数精度舍入，最终值精确落到目标；科学计数法也计算小数精度。decimalPlaces 的有限值限制在 0～20 并向下取整，非法值按未设置处理。format 接收每帧展示值并完全接管格式化，纯数字展示默认仍使用当前运行环境的区域格式。</p>

      <h2 class="docs-section__title" id="statistic-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TStatistic" />
      </div>

      <docs-page-nav current="/statistic" />
    </article>
  `,
})
export class StatisticDocs {}
