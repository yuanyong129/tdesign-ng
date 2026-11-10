import { Component } from '@angular/core';
import { TLinkModule, TSpaceModule } from '@tdesign-ng/components';
import { TIcon } from '@tdesign-ng/icons';
import { ApiTable } from '../../api/api-table.component';

@Component({
  selector: 'link-docs',
  imports: [TLinkModule, TSpaceModule, TIcon, ApiTable],
  template: `
    <h2>链接 Link</h2>
    <p class="description">链接用于跳转到其他页面或悬浮显示提示信息。</p>

    <h3 class="description">基础链接</h3>
    <div class="docs-block">
      <t-space break-line>
        <t-link href="#basic">默认链接</t-link>
        <t-link href="#basic" theme="primary">主要链接</t-link>
        <t-link href="#basic" theme="danger">危险链接</t-link>
        <t-link href="#basic" theme="warning">警告链接</t-link>
        <t-link href="#basic" theme="success">成功链接</t-link>
      </t-space>
    </div>

    <h3 class="description">下划线</h3>
    <p class="description">underline 控制是否常驻下划线，hover 控制悬浮态表现。</p>
    <div class="docs-block">
      <t-space break-line>
        <t-link href="#underline" [underline]="true">始终下划线</t-link>
        <t-link href="#underline" hover="underline">悬浮下划线</t-link>
        <t-link href="#underline" hover="color">悬浮变色</t-link>
      </t-space>
    </div>

    <h3 class="description">带图标的链接</h3>
    <div class="docs-block">
      <t-space break-line align="center">
        <t-link href="#icon" theme="primary" [hasPrefixIcon]="true">
          <t-icon name="link" tLinkPrefixIcon />带前缀图标
        </t-link>
        <t-link href="#icon" theme="primary" [hasSuffixIcon]="true">
          带后缀图标<t-icon name="arrow-right" tLinkSuffixIcon />
        </t-link>
      </t-space>
    </div>

    <h3 class="description">链接尺寸</h3>
    <div class="docs-block">
      <t-space break-line align="center">
        <t-link href="#size" size="small">小尺寸链接</t-link>
        <t-link href="#size" size="medium">中尺寸链接</t-link>
        <t-link href="#size" size="large">大尺寸链接</t-link>
      </t-space>
    </div>

    <h3 class="description">禁用状态</h3>
    <div class="docs-block">
      <t-space break-line>
        <t-link href="#disabled" [disabled]="true">禁用链接</t-link>
        <t-link href="#disabled" [disabled]="true" [underline]="true">禁用且带下划线</t-link>
      </t-space>
    </div>

    <h3 class="description">下载链接</h3>
    <div class="docs-block">
      <t-link href="data:text/plain;charset=utf-8,hello" download="hello.txt" theme="primary">下载文件</t-link>
    </div>

    <h3 class="description">API</h3>
    <api-table component="TLink" />
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
export class LinkDocs {}
