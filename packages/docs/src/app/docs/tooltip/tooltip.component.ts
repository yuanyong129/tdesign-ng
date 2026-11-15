import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoTooltipBasic } from './demos/tooltip-basic';
import { DemoTooltipDuration } from './demos/tooltip-duration';
import { DemoTooltipPlacement } from './demos/tooltip-placement';
import { DemoTooltipTheme } from './demos/tooltip-theme';

@Component({
  selector: 'tooltip-docs',
  imports: [ApiTable, DemoBlock, PageNav, DemoTooltipBasic, DemoTooltipTheme, DemoTooltipPlacement, DemoTooltipDuration],
  template: `
    <div class="docs-page">
      <h1 class="docs-page__title">文字提示 Tooltip</h1>
      <p class="docs-page__lead">
        文字提示用于在悬停时补充说明，底层复用 Popup 的定位逻辑，额外提供主题与自动消失能力。
      </p>

      <docs-demo id="tooltip-basic" title="基础用法" description="默认出现在触发器上方，hover 触发。">
        <demo-tooltip-basic />
      </docs-demo>

      <docs-demo id="tooltip-theme" title="主题" description="theme 支持 default / primary / success / warning / danger / light 六种。">
        <demo-tooltip-theme />
      </docs-demo>

      <docs-demo id="tooltip-placement" title="出现位置" description="placement 支持四个方向与 8 个对角方向。">
        <demo-tooltip-placement />
      </docs-demo>

      <docs-demo id="tooltip-duration" title="延迟与自动消失" description="delay 控制出现延迟，duration 控制自动消失。">
        <demo-tooltip-duration />
      </docs-demo>

      <h2 class="docs-section__title" id="tooltip-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TTooltip" />
      </div>

      <docs-page-nav current="/tooltip" />
    </div>
  `,
})
export class TooltipDocs {}
