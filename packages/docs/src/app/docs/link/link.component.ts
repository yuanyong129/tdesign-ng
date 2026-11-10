import { Component } from "@angular/core";
import { TDividerModule, TSpaceModule, TLinkModule } from "@tdesign-ng/components";

@Component({
  selector: 'link-docs',
  imports: [TDividerModule, TSpaceModule, TLinkModule],
  template: `
    <h2>链接 Link</h2>
    <p class="description">链接的基本样式。</p>
    <t-divider />
    <h3 class="description">基本用法</h3>
    <p class="description">通过 href 属性设置链接地址。</p>
    <div>
      <t-space>
        <t-link href="link">Link</t-link>
        <t-link href="link" [disabled]="true">Link</t-link>
      </t-space>
    </div>
    <t-divider />
    <h3 class="description">链接的状态</h3>
    <p class="description">链接的状态分为 normal - 正常（默认）、success - 成功、warning - 警告、danger - 危险四种。</p>
    <div>
      <t-space direction="vertical">
        <t-space>
          <t-link href="link">Normal Link</t-link>
          <t-link href="link" [disabled]="true">Normal Link</t-link>
        </t-space>
        <t-space>
          <t-link href="link" status="success">Success Link</t-link>
          <t-link href="link" status="success" [disabled]="true">Success Link</t-link>
        </t-space>
        <t-space>
          <t-link href="link" status="warning">Warning Link</t-link>
          <t-link href="link" status="warning" [disabled]="true">Warning Link</t-link>
        </t-space>
        <t-space>
          <t-link href="link" status="danger">Danger Link</t-link>
          <t-link href="link" status="danger" [disabled]="true">Danger Link</t-link>
        </t-space>
      </t-space>
    </div>
    <h3 class="description">悬浮状态底色</h3>
    <p class="description">可以通过 hoverable 属性设置是否在悬浮状态时隐藏底色。</p>
    <div>
      <t-space>
        <t-link href="link" [hoverable]="false">Link</t-link>
        <t-link href="link" status="danger" [hoverable]="false">Link</t-link>
      </t-space>
    </div>
  `,
  styles: []
})
export class LinkDocs {

}
