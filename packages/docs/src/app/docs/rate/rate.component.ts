import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoRateBasic } from './demos/rate-basic';
import { DemoRateHalf } from './demos/rate-half';
import { DemoRateOptions } from './demos/rate-options';
import { DemoRateText } from './demos/rate-text';
import { DemoRateIcon } from './demos/rate-icon';

@Component({
  selector: 'rate-docs',
  imports: [ApiTable, DemoBlock, PageNav, DemoRateBasic, DemoRateHalf, DemoRateText, DemoRateOptions, DemoRateIcon],
  template: `
    <div class="docs-page">
      <h1 class="docs-page__title">评分 Rate</h1>
      <p class="docs-page__lead">
        评分用于对内容进行等级评价，支持半星、自定义数量与间距、选中与未选中颜色、禁用、再次点击清空以及评分文案。
      </p>

      <docs-demo id="rate-basic" title="基础用法" description="value 受控，(change) 抛出 { value }，默认为 5 星、单星为 24px。">
        <demo-rate-basic />
      </docs-demo>

      <docs-demo id="rate-half" title="半星" description="allowHalf 为 true 时，点击图标左半边选半星、右半边选整星。">
        <demo-rate-half />
      </docs-demo>

      <docs-demo id="rate-text" title="评分文案" description="showText 显示当前档位的文案，texts 可自定义每一档的文字。">
        <demo-rate-text />
      </docs-demo>

      <docs-demo id="rate-options" title="更多配置" description="count 控制星星数量、gap 控制间距、color 支持 [选中色, 未选中色]、clearable 支持再次点击清空、disabled 禁用。">
        <demo-rate-options />
      </docs-demo>

      <docs-demo id="rate-icon" title="自定义图标" description="icon 支持字符串或模板，模板使用 currentColor 继承选中和未选中颜色；保留半星、清空与禁用行为。">
        <demo-rate-icon />
      </docs-demo>

      <h2 class="docs-section__title" id="rate-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TRate" />
      </div>

      <docs-page-nav current="/rate" />
    </div>
  `,
})
export class RateDocs {}
