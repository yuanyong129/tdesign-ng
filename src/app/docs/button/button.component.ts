import { Component } from "@angular/core";
import { ArcoButtonModule } from "../../../../projects/components/src";
import { ArcoSpaceModule } from "../../../../projects/components/src";
import { ArcoButtonGroupModule } from "../../../../projects/components/src";

@Component({
  selector: 'button-docs',
  imports: [
    ArcoButtonModule,
    ArcoSpaceModule,
    ArcoButtonGroupModule
  ],
  template: `
    <h2>Button 组件</h2>

    <h3 class="description">基本用法</h3>
    <p class="description">按钮分为 primary - 主要按钮、secondary - 次要按钮（默认）、dashed - 虚线按钮、outline - 线形按钮、text - 文本按钮五种类型。</p>
    <a-space>
      <a-button type="primary">Primary</a-button>
      <a-button>Secondary</a-button>
      <a-button type="dashed">Dashed</a-button>
      <a-button type="outline">Outline</a-button>
      <a-button type="text">Text</a-button>
      456 456
    </a-space>

    <h3 class="description">按钮形状</h3>
    <p class="description">按钮分为 round - 圆角按钮、square - 方形按钮（默认）两种形状。</p>
    <a-space>
      <a-button type="primary">Square</a-button>
      <a-button type="primary" shape="round">Round</a-button>
    </a-space>

    <h3 class="description">按钮尺寸</h3>
    <p class="description">按钮分为 mini、small、medium、large 四种尺寸。高度分别为：24px、28px、32px、36px。推荐（默认）尺寸为 medium。可在不同场景及不同业务需求选择适合尺寸。</p>
    <a-space>
      <a-button type="primary" size="mini">Mini</a-button>
      <a-button type="primary" size="small">Small</a-button>
      <a-button type="primary">Medium</a-button>
      <a-button type="primary" size="large">Large</a-button>
    </a-space>

    <h3 class="description">按钮状态</h3>
    <p class="description">按钮的状态分为 normal - 正常（默认）、success - 成功、warning - 警告、danger - 危险四种，可以与按钮类型同时使用。</p>
    <a-space direction="vertical">
      <a-space>
        <a-button type="primary" status="success">Primary</a-button>
        <a-button status="success">Default</a-button>
        <a-button type="dashed" status="success">Dashed</a-button>
        <a-button type="outline" status="success">Outline</a-button>
        <a-button type="text" status="success">Text</a-button>
      </a-space>
      <a-space>
        <a-button type="primary" status="warning">Primary</a-button>
        <a-button status="warning">Default</a-button>
        <a-button type="dashed" status="warning">Dashed</a-button>
        <a-button type="outline" status="warning">Outline</a-button>
        <a-button type="text" status="warning">Text</a-button>
      </a-space>
      <a-space>
        <a-button type="primary" status="danger">Primary</a-button>
        <a-button status="danger">Default</a-button>
        <a-button type="dashed" status="danger">Dashed</a-button>
        <a-button type="outline" status="danger">Outline</a-button>
        <a-button type="text" status="danger">Text</a-button>
      </a-space>
    </a-space>

    <h3 class="description">禁用状态</h3>
    <p class="description">按钮的禁用状态。</p>
    <a-space direction="vertical">
      <a-space>
        <a-button type="primary" [disabled]="true">Primary</a-button>
        <a-button [disabled]="true">Default</a-button>
        <a-button type="dashed" [disabled]="true">Dashed</a-button>
        <a-button type="outline" [disabled]="true">Outline</a-button>
        <a-button type="text" [disabled]="true">Text</a-button>
      </a-space>
      <a-space>
        <a-button type="primary" status="success" [disabled]="true">Primary</a-button>
        <a-button status="success" [disabled]="true">Default</a-button>
        <a-button type="dashed" status="success" [disabled]="true">Dashed</a-button>
        <a-button type="outline" status="success" [disabled]="true">Outline</a-button>
        <a-button type="text" status="success" [disabled]="true">Text</a-button>
      </a-space>
      <a-space>
        <a-button type="primary" status="warning" [disabled]="true">Primary</a-button>
        <a-button status="warning" [disabled]="true">Default</a-button>
        <a-button type="dashed" status="warning" [disabled]="true">Dashed</a-button>
        <a-button type="outline" status="warning" [disabled]="true">Outline</a-button>
        <a-button type="text" status="warning" [disabled]="true">Text</a-button>
      </a-space>
      <a-space>
        <a-button type="primary" status="danger" [disabled]="true">Primary</a-button>
        <a-button status="danger" [disabled]="true">Default</a-button>
        <a-button type="dashed" status="danger" [disabled]="true">Dashed</a-button>
        <a-button type="outline" status="danger" [disabled]="true">Outline</a-button>
        <a-button type="text" status="danger" [disabled]="true">Text</a-button>
      </a-space>
    </a-space>


    <h3 class="description">组合按钮</h3>
    <p class="description">通过 &lt;a-button-group&gt; 组件使按钮以组合方式出现。可用在同级多项操作中。</p>
    <a-button-group type="primary">
      <a-button shape="round"> copy </a-button>
      <a-button shape="round"> cut </a-button>
      <a-button shape="round"> find </a-button>
    </a-button-group>
    <a-button-group type="outline" [disabled]="true">
      <a-button shape="round"> copy </a-button>
      <a-button shape="round"> cut </a-button>
      <a-button shape="round"> find </a-button>
    </a-button-group>
    <a-button-group type="dashed">
      <a-button shape="round"> copy </a-button>
      <a-button shape="round"> cut </a-button>
      <a-button shape="round"> find </a-button>
    </a-button-group>
  `,
  styles: [

  ]
})
export class ButtonDocs {

}
