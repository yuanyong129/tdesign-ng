import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoStepsBase } from './demos/steps-base';
import { DemoStepsDot } from './demos/steps-dot';
import { DemoStepsVertical } from './demos/steps-vertical';
import { DemoStepsSequence } from './demos/steps-sequence';

@Component({
  selector: 'steps-docs',
  imports: [ApiTable, DemoBlock, PageNav, DemoStepsBase, DemoStepsDot, DemoStepsVertical, DemoStepsSequence],
  template: `
    <article class="docs-page">
      <h1 class="docs-page__title">步骤条 Steps</h1>
      <p class="docs-page__lead">
        步骤条用于展示任务的分步流程，支持横向/竖向排列、序号与状态自动计算，点击步骤即可切换当前步骤。
      </p>

      <docs-demo
        id="steps-base"
        title="基础用法"
        description="current 指定当前步骤，传 0 起的下标；配合 currentChange 双向切换，点击步骤也能改变当前步骤。"
      >
        <demo-steps-base />
      </docs-demo>

      <docs-demo
        id="steps-vertical"
        title="竖向步骤条"
        description="layout 为 vertical 时竖向排列，适合步骤较多或标题较长的场景；单项 status 可覆盖自动计算的状态。"
      >
        <demo-steps-vertical />
      </docs-demo>

      <docs-demo
        id="steps-dot"
        title="点状与只读"
        description="theme 为 dot 时只显示圆点、不显示序号，separator 可以换成虚线连接；readonly 时步骤不可点击。"
      >
        <demo-steps-dot />
      </docs-demo>

      <docs-demo id="steps-sequence" title="逆序、受控与状态保留" description="sequence 逆序显示步骤，保留原来的步骤值、序号、模板实例及内部计数。切换横纵方向、主题和连接线，或拒绝切换提案，观察状态变化。">
        <demo-steps-sequence />
      </docs-demo>
      <p class="demo-hint">sequence 只改变显示顺序，完成状态仍按原流程计算；未设置 value 的项继续使用原始下标。非空 options 优先于投影，空数组回退；数据项的 value 应唯一且稳定，省略时按对象身份保留实例。defaultCurrent 只初始化一次；受控 current 由调用方接收 currentChange 后更新，拒绝提案保持原状态。change 额外提供 current、previous、e，currentChange 只提供新值用于双向绑定。FINISH 让未显式覆盖状态的项全部完成；非法 current 不自动切换到首项。</p>
      <p class="demo-hint">只读与 process 项不可操作；可操作项支持 Tab、Enter / 空格，方向键按显示方向移动焦点，Home / End 定位，均不改变业务步骤值的含义。任一项设置 icon（包括布尔值）会统一使用 default 主题；true 使用默认图标，false 隐藏该项图标，字符串或模板渲染自定义内容。投影组件由 Angular 创建；逆序移动原宿主，不销毁重建。完整 SSR / 水合仍待后续验收。</p>

      <h2 class="docs-section__title" id="steps-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TSteps" />
        <api-table component="TStepItem" />
      </div>

      <docs-page-nav current="/steps" />
    </article>
  `,
})
export class StepsDocs {}
