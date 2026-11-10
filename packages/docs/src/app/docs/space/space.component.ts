import { Component } from "@angular/core";
import { TButtonModule, TSpaceModule, TDividerModule } from "@tdesign-ng/components";

@Component({
  selector: 'button-docs',
  imports: [
    TButtonModule,
    TSpaceModule,
    TDividerModule
  ],
  template: `
    <h2>间距 Space</h2>
    <div>设置组件之间的间距</div>
    <t-divider />
    <h3 class="description">垂直间距</h3>
    <p class="description">可以设置垂直方向排列的间距。</p>
    <div style="padding: 20px;">
      <t-space direction="vertical" [fill]="true">
        <t-button type="primary" [long]="true">Item1</t-button>
        <t-button type="primary" [long]="true">Item2</t-button>
        <t-button type="primary" [long]="true">Item3</t-button>
      </t-space>
    </div>
    <h3 class="description">分隔符</h3>
    <p class="description">为相邻子元素设置分隔符。</p>
    <t-space>
      <!-- <a-tag v-if="false" color='arcoblue'>Tag</a-tag> -->
      <t-button type="primary">Item1</t-button>
      <t-button type="primary">Item2</t-button>
      <t-button type="primary">Item3</t-button>
      <!-- <a-switch defaultChecked /> -->
      <t-divider split direction="vertical" />
    </t-space>
  `,
  styles: []
})
export class SpaceDocs {

}
