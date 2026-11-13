import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoSwitchBasic } from './demos/switch-basic';
import { DemoSwitchCustom } from './demos/switch-custom';
import { DemoSwitchLabel } from './demos/switch-label';
import { DemoSwitchSize } from './demos/switch-size';
import { DemoSwitchState } from './demos/switch-state';

@Component({
  selector: 'switch-docs',
  imports: [ApiTable, DemoBlock, PageNav, DemoSwitchBasic, DemoSwitchLabel, DemoSwitchSize, DemoSwitchState, DemoSwitchCustom],
  template: `
    <div class="docs-page">
      <h1 class="docs-page__title">开关 Switch</h1>
      <p class="docs-page__lead">
        开关用于在两种状态间切换，切换结果立即生效，不需要额外提交。
      </p>

      <docs-demo id="switch-basic" title="基础开关" description="通过 [(value)] 双向绑定开关状态。">
        <demo-switch-basic />
      </docs-demo>

      <docs-demo id="switch-label" title="带文字的开关" description="label 传字符串时两侧都显示同一段文字，传数组则是 [选中, 未选中]。">
        <demo-switch-label />
      </docs-demo>

      <docs-demo id="switch-size" title="尺寸" description="尺寸有 small、medium（默认）、large 三档。">
        <demo-switch-size />
      </docs-demo>

      <docs-demo id="switch-state" title="禁用与加载中" description="disabled 不可交互，loading 时显示旋转环并阻止切换。">
        <demo-switch-state />
      </docs-demo>

      <docs-demo id="switch-custom" title="自定义值" description="customValue 传 [选中值, 未选中值]，可以是字符串或数字。">
        <demo-switch-custom />
      </docs-demo>

      <h2 class="docs-section__title" id="switch-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TSwitch" />
      </div>

      <docs-page-nav current="/switch" />
    </div>
  `,
})
export class SwitchDocs {}
