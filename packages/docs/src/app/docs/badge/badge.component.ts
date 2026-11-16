import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoBadgeBasic } from './demos/badge-basic';
import { DemoBadgeShape } from './demos/badge-shape';

@Component({
  selector: 'badge-docs',
  imports: [ApiTable, DemoBlock, PageNav, DemoBadgeBasic, DemoBadgeShape],
  template: `
    <div class="docs-page">
      <h1 class="docs-page__title">徽标 Badge</h1>
      <p class="docs-page__lead">
        徽标用于在图标或文字右上角展示数量或状态，支持数字封顶、小红点与自定义位置。
      </p>

      <docs-demo id="badge-basic" title="基础用法" description="把需要标记的内容投影进 t-badge 即可。">
        <demo-badge-basic />
      </docs-demo>

      <docs-demo id="badge-shape" title="形状与偏移" description="shape / size / showZero / offset / color 的组合。">
        <demo-badge-shape />
      </docs-demo>

      <h2 class="docs-section__title" id="badge-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TBadge" />
      </div>

      <docs-page-nav current="/badge" />
    </div>
  `,
})
export class BadgeDocs {}
