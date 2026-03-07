import { Component } from "@angular/core";
import { ArcoDividerModule, ArcoSpaceModule, ArcoLinkModule } from "@web-ng/index";

@Component({
  selector: 'link-docs',
  imports: [ArcoDividerModule, ArcoSpaceModule, ArcoLinkModule],
  template: `
    <h2>链接 Link</h2>
    <p class="description">链接的基本样式。</p>
    <a-divider />
    <h3 class="description">基本用法</h3>
    <p class="description">通过 href 属性设置链接地址。</p>
    <div>
      <a-space>
        <a-link href="link">Link</a-link>
        <a-link href="link" [disabled]="true">Link</a-link>
      </a-space>
    </div>
    <a-divider />
    <h3 class="description">链接的状态</h3>
    <p class="description">链接的状态分为 normal - 正常（默认）、success - 成功、warning - 警告、danger - 危险四种。</p>
    <div>
      <a-space direction="vertical">
        <a-space>
          <a-link href="link">Normal Link</a-link>
          <a-link href="link" [disabled]="true">Normal Link</a-link>
        </a-space>
        <a-space>
          <a-link href="link" status="success">Success Link</a-link>
          <a-link href="link" status="success" [disabled]="true">Success Link</a-link>
        </a-space>
        <a-space>
          <a-link href="link" status="warning">Warning Link</a-link>
          <a-link href="link" status="warning" [disabled]="true">Warning Link</a-link>
        </a-space>
        <a-space>
          <a-link href="link" status="danger">Danger Link</a-link>
          <a-link href="link" status="danger" [disabled]="true">Danger Link</a-link>
        </a-space>
      </a-space>
    </div>
    <h3 class="description">悬浮状态底色</h3>
    <p class="description">可以通过 hoverable 属性设置是否在悬浮状态时隐藏底色。</p>
    <div>
      <a-space>
        <a-link href="link" [hoverable]="false">Link</a-link>
        <a-link href="link" status="danger" [hoverable]="false">Link</a-link>
      </a-space>
    </div>
  `,
  styles: []
})
export class LinkDocs {

}
