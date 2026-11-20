import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoSliderBasic } from './demos/slider-basic';
import { DemoSliderMarks } from './demos/slider-marks';
import { DemoSliderRange } from './demos/slider-range';
import { DemoSliderVertical } from './demos/slider-vertical';

@Component({
  selector: 'slider-docs',
  imports: [ApiTable, DemoBlock, PageNav, DemoSliderBasic, DemoSliderRange, DemoSliderMarks, DemoSliderVertical],
  template: `
    <div class="docs-page">
      <h1 class="docs-page__title">滑块 Slider</h1>
      <p class="docs-page__lead">
        滑块用于在一个区间内选择数值，支持单值与区间、步长与刻度、横向与竖向布局、提示文案与键盘操作。
      </p>

      <docs-demo id="slider-basic" title="基础用法" description="value 受控，label 为 true 时提示当前值，为字符串时可用 {value} 占位。">
        <demo-slider-basic />
      </docs-demo>

      <docs-demo id="slider-range" title="区间选择" description="range 为 true 时渲染两个滑块，值形如 [start, end]。">
        <demo-slider-range />
      </docs-demo>

      <docs-demo id="slider-marks" title="步长与刻度" description="step 控制步长，showStep 显示步长点，marks 定义带文案的刻度。">
        <demo-slider-marks />
      </docs-demo>

      <docs-demo id="slider-vertical" title="竖向布局" description="layout 为 vertical 时纵向渲染，需要给宿主元素设定高度。">
        <demo-slider-vertical />
      </docs-demo>

      <h2 class="docs-section__title" id="slider-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TSlider" />
      </div>

      <docs-page-nav current="/slider" />
    </div>
  `,
})
export class SliderDocs {}
