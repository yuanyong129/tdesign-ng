import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoStepsBase } from './demos/steps-base';
import { DemoStepsDot } from './demos/steps-dot';
import { DemoStepsVertical } from './demos/steps-vertical';

@Component({
  selector: 'steps-docs',
  imports: [ApiTable, DemoBlock, PageNav, DemoStepsBase, DemoStepsDot, DemoStepsVertical],
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
