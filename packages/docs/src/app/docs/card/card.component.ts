import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoCardBasic } from './demos/card-basic';
import { DemoCardCover } from './demos/card-cover';
import { DemoCardLoading } from './demos/card-loading';
import { DemoCardLoadingProps } from './demos/card-loading-props';

@Component({
  selector: 'card-docs',
  imports: [ApiTable, DemoBlock, PageNav, DemoCardBasic, DemoCardCover, DemoCardLoading, DemoCardLoadingProps],
  template: `
    <article class="docs-page">
      <h1 class="docs-page__title">卡片 Card</h1>
      <p class="docs-page__lead">
        卡片用于承载信息，把标题、描述、操作与内容组织在一个可复用的容器里，常与列表、栅格等组件搭配使用。
      </p>

      <docs-demo
        id="card-basic"
        title="基础用法"
        description="用 title、subtitle、description 组织说明文字，actions 显示操作区，footer 承载底部内容，卡片主体由内容投影传入。"
      >
        <demo-card-basic />
      </docs-demo>

      <docs-demo
        id="card-cover"
        title="封面与头像"
        description="cover 传入图片地址或模板，头部支持 avatar 头像；theme 设为 poster2 时操作区会移到卡片底部。"
      >
        <demo-card-cover />
      </docs-demo>

      <docs-demo
        id="card-loading"
        title="加载状态"
        description="loading 为 true 时卡片主体显示加载中，头部与底部保持可见。"
      >
        <demo-card-loading />
      </docs-demo>

      <docs-demo id="card-loading-props" title="自定义加载配置" description="loadingProps 配置当前 LoadingOptions 支持的文字、尺寸、延迟和全屏等属性；加载时保留主体实例与状态。attach 和自定义 indicator 等能力暂不支持。">
        <demo-card-loading-props />
      </docs-demo>

      <h2 class="docs-section__title" id="card-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TCard" />
      </div>

      <docs-page-nav current="/card" />
    </article>
  `,
})
export class CardDocs {}
