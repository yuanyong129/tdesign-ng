import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoAffixBase } from './demos/affix-base';
import { DemoAffixContainer } from './demos/affix-container';
import { DemoAffixFixedChange } from './demos/affix-fixed-change';

@Component({
  selector: 'affix-docs',
  imports: [ApiTable, DemoBlock, PageNav, DemoAffixBase, DemoAffixContainer, DemoAffixFixedChange],
  template: `
    <article class="docs-page">
      <h1 class="docs-page__title">固钉 Affix</h1>
      <p class="docs-page__lead">固钉把内容固定在滚动容器的顶部或底部，滚动到边界时自动取消吸附。</p>

      <docs-demo
        id="affix-base"
        title="基础固钉"
        description="offsetTop 决定吸附时距离容器顶部的位置，container 指定监听滚动的容器。"
      >
        <demo-affix-base />
      </docs-demo>

      <docs-demo
        id="affix-container"
        title="底部吸附"
        description="滚到容器底部时按 offsetBottom 夹住，继续向上滚动又回到顶部吸附。"
      >
        <demo-affix-container />
      </docs-demo>

      <docs-demo
        id="affix-fixed-change"
        title="吸附状态变化"
        description="fixedChange 在吸附状态翻转时派发，参数里带当前状态与吸附后的顶部坐标。"
      >
        <demo-affix-fixed-change />
      </docs-demo>

      <h2 class="docs-section__title" id="affix-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TAffix" />
      </div>

      <docs-page-nav current="/affix" />
    </article>
  `,
})
export class AffixDocs {}
