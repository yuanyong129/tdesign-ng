import { Component } from "@angular/core";
import { ArcoButtonModule, ArcoSpaceModule, ArcoDividerModule } from "@web-ng/index";

@Component({
  selector: 'button-docs',
  imports: [
    ArcoButtonModule,
    ArcoSpaceModule,
    ArcoDividerModule
  ],
  template: `
    <h2>间距 Space</h2>
    <div>设置组件之间的间距</div>
    <a-divider />
    <h3 class="description">垂直间距</h3>
    <p class="description">可以设置垂直方向排列的间距。</p>
    <div style="padding: 20px;">
      <a-space direction="vertical" [fill]="true">
        <a-button type="primary" [long]="true">Item1</a-button>
        <a-button type="primary" [long]="true">Item2</a-button>
        <a-button type="primary" [long]="true">Item3</a-button>
      </a-space>
    </div>
    <h3 class="description">分隔符</h3>
    <p class="description">为相邻子元素设置分隔符。</p>
    <a-space>
      <!-- <a-tag v-if="false" color='arcoblue'>Tag</a-tag> -->
      <a-button type="primary">Item1</a-button>
      <a-button type="primary">Item2</a-button>
      <a-button type="primary">Item3</a-button>
      <!-- <a-switch defaultChecked /> -->
      <a-divider split direction="vertical" />
    </a-space>
  `,
  styles: []
})
export class SpaceDocs {

}
