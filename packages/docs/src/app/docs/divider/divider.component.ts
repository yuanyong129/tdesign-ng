import { Component } from '@angular/core';
import { TDividerModule, TSpaceModule } from '@tdesign-ng/components';
import { ApiTable } from '../../api/api-table.component';

@Component({
  selector: 'divider-docs',
  imports: [TDividerModule, TSpaceModule, ApiTable],
  template: `
    <h2>分割线 Divider</h2>
    <p class="description">分割线用于将内容分块，支持水平、垂直、虚线与带文字四种形态。</p>

    <h3 class="description">水平分割线</h3>
    <div class="docs-block">
      <p>通过设置内容区块的分割线，让结构更清晰。</p>
      <t-divider />
      <p>使用虚线分割线。</p>
      <t-divider [dashed]="true" />
      <p>分割线可以带文字。</p>
      <t-divider>文字分割线</t-divider>
    </div>

    <h3 class="description">带文字的分割线</h3>
    <p class="description">通过 align 控制文字位置：left、center、right。</p>
    <div class="docs-block">
      <t-divider align="left">左侧文字</t-divider>
      <t-divider align="center">居中文字</t-divider>
      <t-divider align="right">右侧文字</t-divider>
    </div>

    <h3 class="description">垂直分割线</h3>
    <div class="docs-block">
      <t-space align="center">
        <span>文本</span>
        <t-divider layout="vertical" />
        <span>文本</span>
        <t-divider layout="vertical" />
        <span>文本</span>
      </t-space>
    </div>

    <h3 class="description">自定义间距</h3>
    <div class="docs-block">
      <p>上下间距 32px。</p>
      <t-divider [size]="32" />
      <p>上下间距 8px。</p>
      <t-divider [size]="8" />
    </div>

    <h3 class="description">API</h3>
    <api-table component="TDivider" />
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
  `,
})
export class DividerDocs {}
