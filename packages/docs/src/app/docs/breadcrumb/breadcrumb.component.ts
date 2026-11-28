import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoBreadcrumbBase } from './demos/breadcrumb-base';
import { DemoBreadcrumbOptions } from './demos/breadcrumb-options';
import { DemoBreadcrumbSeparator } from './demos/breadcrumb-separator';
import { DemoBreadcrumbCollapse } from './demos/breadcrumb-collapse';

@Component({
  selector: 'breadcrumb-docs',
  imports: [ApiTable, DemoBlock, PageNav, DemoBreadcrumbBase, DemoBreadcrumbOptions, DemoBreadcrumbSeparator, DemoBreadcrumbCollapse],
  template: `
    <article class="docs-page">
      <h1 class="docs-page__title">面包屑 Breadcrumb</h1>
      <p class="docs-page__lead">
        面包屑用于展示当前页面在层级结构中的位置，并支持快速返回上级页面；既可以投影子项，也可以用 options 数据驱动。
      </p>

      <docs-demo
        id="breadcrumb-base"
        title="基础用法"
        description="最后一项代表当前页面；设置 href 的项渲染为链接，其余项只是文本。"
      >
        <demo-breadcrumb-base />
      </docs-demo>

      <docs-demo
        id="breadcrumb-separator"
        title="分隔符"
        description="separator 支持字符串（如 > 和 /），也支持模板，模板里可以放图标。"
      >
        <demo-breadcrumb-separator />
      </docs-demo>

      <docs-demo
        id="breadcrumb-options"
        title="选项式用法"
        description="用 options 传入数据、由父容器统一渲染；maxItemWidth 控制单项最大宽度，disabled 让某一项不可点击。"
      >
        <demo-breadcrumb-options />
      </docs-demo>

      <docs-demo id="breadcrumb-collapse" title="折叠路径与完整提示" description="总项数超过 maxItems 时保留前后指定项，点击省略号访问隐藏路径。投影项移动原宿主，保留事件和组件状态；内容超宽时显示文字提示。">
        <demo-breadcrumb-collapse />
      </docs-demo>
      <p class="demo-hint">maxItems、itemsBeforeCollapse、itemsAfterCollapse 必须同时为正数，前后保留总数小于实际总数时才折叠；maxItems 是触发阈值，不是含省略号的最终数量上限。未设置、0、负数和非有限数不折叠，小数向下取整。options 排在投影项之前，两者共同计算。ellipsis 接收文本或模板，模板通过 let-items="items"、let-separator="separator" 读取隐藏项描述和分隔符配置；投影文字描述为实时测量文本，原交互内容仍在默认弹层中。默认弹层是本库补充的访问入口，锁定上游默认仅显示省略图标。Enter / 空格开关，方向下键进入弹层，弹层内方向键及 Home / End 移动焦点，Esc 关闭并返回触发器。修改路径或折叠参数时关闭弹层。</p>
      <p class="demo-hint">options.onClick 接收 MouseEvent，可 preventDefault 取消导航；禁用项阻止链接导航和宿主点击回调，投影内部控件的禁用由调用方管理。最后一项使用 aria-current="page"。超宽提示使用实时纯文本，不复制交互模板。to / replace / router 尚未接入，继续使用 href；Angular Router 整合保留在后续任务。</p>

      <h2 class="docs-section__title" id="breadcrumb-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TBreadcrumb" />
        <api-table component="TBreadcrumbItem" />
      </div>

      <docs-page-nav current="/breadcrumb" />
    </article>
  `,
})
export class BreadcrumbDocs {}
