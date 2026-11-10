import { Component } from "@angular/core";
import { TDividerModule  } from "@tdesign-ng/components";

@Component({
  selector: 'divider-docs',
  imports: [TDividerModule],
  template: `
    <h2>Divider 组件</h2>
    <p class="description">划分内容区域，对模块做分隔。</p>
    <t-divider />
    <h3 class="description">基本用法</h3>
    <p class="description">对不同章节的文本段落进行分割，默认为水平分割线，可在中间加入文字。</p>
    <div class="divider-demo">
      <p>A design is a plan or specification for the construction of an object.</p>
      <t-divider />
      <p>A design is a plan or specification for the construction of an object.</p>
      <t-divider type="dashed" />
      <p>A design is a plan or specification for the construction of an object.</p>
      <t-divider [size]="2" type="dotted" />
      <p>A design is a plan or specification for the construction of an object.</p>
    </div>
    <h3 class="description">竖直分割线</h3>
    <p class="description">指定 direction 为 vertical 即可使用竖直分割线。竖直分割线不能带文字。</p>
    <div class="divider-demo">
      <span>Item 1</span>
      <t-divider direction="vertical" />
      <span>Item 2</span>
      <t-divider direction="vertical" />
      <span>Item 3</span>
    </div>
    `,
    styles: `
      .divider-demo {
        box-sizing: border-box;
        width: 560px;
        padding: 24px;
        border: 30px solid rgb(var(--gray-2));
      }
    `
})
export class DividerDocs {
}
