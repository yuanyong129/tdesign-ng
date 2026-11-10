import { Component } from '@angular/core';
import { TButtonModule, TSpaceModule } from '@tdesign-ng/components';
import { TIcon } from '@tdesign-ng/icons';
import { ApiTable } from '../../api/api-table.component';

@Component({
  selector: 'button-docs',
  imports: [TButtonModule, TSpaceModule, TIcon, ApiTable],
  template: `
    <h2>按钮 Button</h2>
    <p class="description">按钮用于开始一个即时操作，标记了一个（或封装一组）操作命令。</p>

    <h3 class="description">基础按钮</h3>
    <p class="description">按钮的四种变体：base（基础）、outline（描边）、dashed（虚线）、text（文本）。</p>
    <div class="docs-block">
      <t-space break-line>
        <t-button variant="base" theme="default">基础按钮</t-button>
        <t-button variant="outline" theme="default">描边按钮</t-button>
        <t-button variant="dashed" theme="default">虚线按钮</t-button>
        <t-button variant="text" theme="default">文本按钮</t-button>
      </t-space>
    </div>

    <h3 class="description">按钮主题</h3>
    <p class="description">按钮支持五种主题：default、primary、danger、warning、success。</p>
    <div class="docs-block">
      <t-space break-line>
        <t-button theme="default">默认</t-button>
        <t-button theme="primary">主要</t-button>
        <t-button theme="danger">危险</t-button>
        <t-button theme="warning">警告</t-button>
        <t-button theme="success">成功</t-button>
      </t-space>
    </div>

    <h3 class="description">不同主题的变体</h3>
    <p class="description">theme 与 variant 可以自由组合。</p>
    <div class="docs-block">
      @for (theme of themes; track theme) {
        <t-space break-line>
          <t-button variant="base" [theme]="theme">{{ theme }}</t-button>
          <t-button variant="outline" [theme]="theme">{{ theme }}</t-button>
          <t-button variant="dashed" [theme]="theme">{{ theme }}</t-button>
          <t-button variant="text" [theme]="theme">{{ theme }}</t-button>
        </t-space>
      }
    </div>

    <h3 class="description">按钮形状</h3>
    <div class="docs-block">
      <t-space break-line>
        <t-button shape="rectangle" theme="primary">矩形按钮</t-button>
        <t-button shape="square" theme="primary">方</t-button>
        <t-button shape="round" theme="primary">圆角按钮</t-button>
        <t-button shape="circle" theme="primary">圆</t-button>
      </t-space>
    </div>

    <h3 class="description">按钮尺寸</h3>
    <div class="docs-block">
      <t-space align="center" break-line>
        <t-button size="small" theme="primary">小尺寸</t-button>
        <t-button size="medium" theme="primary">中尺寸</t-button>
        <t-button size="large" theme="primary">大尺寸</t-button>
      </t-space>
    </div>

    <h3 class="description">块级按钮</h3>
    <div class="docs-block">
      <t-button [block]="true" theme="primary">块级按钮</t-button>
    </div>

    <h3 class="description">幽灵按钮</h3>
    <p class="description">幽灵按钮背景透明，通常用于深色背景。</p>
    <div class="docs-block docs-block--dark">
      <t-space break-line>
        <t-button [ghost]="true" variant="outline">幽灵按钮</t-button>
        <t-button [ghost]="true" variant="base" theme="primary">幽灵按钮</t-button>
      </t-space>
    </div>

    <h3 class="description">带图标的按钮</h3>
    <div class="docs-block">
      <t-space break-line align="center">
        <t-button theme="primary"><t-icon name="add" tButtonIcon />新建</t-button>
        <t-button variant="outline">下载<t-icon name="download" tButtonSuffix /></t-button>
        <t-button shape="square" theme="primary"><t-icon name="search" tButtonIcon /></t-button>
      </t-space>
    </div>

    <h3 class="description">禁用与加载</h3>
    <div class="docs-block">
      <t-space break-line>
        <t-button [disabled]="true">禁用按钮</t-button>
        <t-button [disabled]="true" theme="primary">禁用按钮</t-button>
        <t-button [loading]="true" theme="primary">加载中</t-button>
        <t-button [loading]="true" variant="outline">加载中</t-button>
      </t-space>
    </div>

    <h3 class="description">链接按钮</h3>
    <p class="description">设置 href 或 tag="a" 后渲染为 &lt;a&gt; 元素。</p>
    <div class="docs-block">
      <t-space break-line>
        <t-button href="https://tdesign.tencent.com/" target="_blank" variant="text" theme="primary">跳转链接</t-button>
        <t-button tag="div" variant="outline">div 按钮</t-button>
      </t-space>
    </div>

    <h3 class="description">API</h3>
    <api-table component="TButton" />
  `,
  styles: `
    :host {
      display: block;
    }

    .docs-block {
      padding: 16px;
      margin-bottom: 16px;
      border: 1px solid var(--td-component-border, #e7e7e7);
      border-radius: 3px;
      background: var(--td-bg-color-container, #fff);
    }

    .docs-block--dark {
      background: #333;
    }
  `,
})
export class ButtonDocs {
  protected readonly themes = ['default', 'primary', 'danger', 'warning', 'success'] as const;
}
