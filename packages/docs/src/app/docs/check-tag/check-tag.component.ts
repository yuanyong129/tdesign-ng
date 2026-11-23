import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoCheckTagBasic } from './demos/check-tag-basic';
import { DemoCheckTagDisabled } from './demos/check-tag-disabled';
import { DemoCheckTagGroup } from './demos/check-tag-group';

@Component({
  selector: 'check-tag-docs',
  imports: [ApiTable, DemoBlock, PageNav, DemoCheckTagBasic, DemoCheckTagGroup, DemoCheckTagDisabled],
  template: `
    <article class="docs-page">
      <h1 class="docs-page__title">可选标签 CheckTag</h1>
      <p class="docs-page__lead">
        可选中的标签，支持单独使用与标签组配合，可单选或多选，也支持禁用与尺寸设置。
      </p>

      <docs-demo
        id="check-tag-basic"
        title="基础用法"
        description="checked 支持双向绑定，defaultChecked 用于非受控初始选中。"
      >
        <demo-check-tag-basic />
      </docs-demo>

      <docs-demo
        id="check-tag-group"
        title="标签组"
        description="options 渲染一组可选标签，multiple 决定单选或多选。"
      >
        <demo-check-tag-group />
      </docs-demo>

      <docs-demo id="check-tag-disabled" title="禁用与尺寸" description="disabled 不可点击，size 支持 small / medium / large。">
        <demo-check-tag-disabled />
      </docs-demo>

      <h2 class="docs-section__title" id="check-tag-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TCheckTag" />
      </div>

      <h2 class="docs-section__title" id="check-tag-group-api">可选标签组 CheckTagGroup</h2>
      <div class="api-table__scroll">
        <api-table component="TCheckTagGroup" />
      </div>

      <docs-page-nav current="/check-tag" />
    </article>
  `,
})
export class CheckTagDocs {}
