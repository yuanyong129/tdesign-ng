import { Component } from "@angular/core";
import { TButtonModule, TSpaceModule, TButtonGroupModule } from "@tdesign-ng/components";
import { ApiTable } from '../../api/api-table.component';

@Component({
  selector: 'button-docs',
  imports: [
    TButtonModule,
    TSpaceModule,
    TButtonGroupModule,
    ApiTable
  ],
  template: `
    <h2>Button 组件</h2>

    <h3 class="description">基本用法</h3>
    <p class="description">按钮分为 primary - 主要按钮、secondary - 次要按钮（默认）、dashed - 虚线按钮、outline - 线形按钮、text - 文本按钮五种类型。</p>
    <t-space>
      <t-button type="primary">Primary</t-button>
      <t-button>Secondary</t-button>
      <t-button type="dashed">Dashed</t-button>
      <t-button type="outline">Outline</t-button>
      <t-button type="text">Text</t-button>
      456 456
    </t-space>

    <h3 class="description">按钮形状</h3>
    <p class="description">按钮分为 round - 圆角按钮、square - 方形按钮（默认）两种形状。</p>
    <t-space>
      <t-button type="primary">Square</t-button>
      <t-button type="primary" shape="round">Round</t-button>
    </t-space>

    <h3 class="description">按钮尺寸</h3>
    <p class="description">按钮分为 mini、small、medium、large 四种尺寸。高度分别为：24px、28px、32px、36px。推荐（默认）尺寸为 medium。可在不同场景及不同业务需求选择适合尺寸。</p>
    <t-space>
      <t-button type="primary" size="mini">Mini</t-button>
      <t-button type="primary" size="small">Small</t-button>
      <t-button type="primary">Medium</t-button>
      <t-button type="primary" size="large">Large</t-button>
    </t-space>

    <h3 class="description">按钮状态</h3>
    <p class="description">按钮的状态分为 normal - 正常（默认）、success - 成功、warning - 警告、danger - 危险四种，可以与按钮类型同时使用。</p>
    <t-space direction="vertical">
      <t-space>
        <t-button type="primary" status="success">Primary</t-button>
        <t-button status="success">Default</t-button>
        <t-button type="dashed" status="success">Dashed</t-button>
        <t-button type="outline" status="success">Outline</t-button>
        <t-button type="text" status="success">Text</t-button>
      </t-space>
      <t-space>
        <t-button type="primary" status="warning">Primary</t-button>
        <t-button status="warning">Default</t-button>
        <t-button type="dashed" status="warning">Dashed</t-button>
        <t-button type="outline" status="warning">Outline</t-button>
        <t-button type="text" status="warning">Text</t-button>
      </t-space>
      <t-space>
        <t-button type="primary" status="danger">Primary</t-button>
        <t-button status="danger">Default</t-button>
        <t-button type="dashed" status="danger">Dashed</t-button>
        <t-button type="outline" status="danger">Outline</t-button>
        <t-button type="text" status="danger">Text</t-button>
      </t-space>
    </t-space>

    <h3 class="description">禁用状态</h3>
    <p class="description">按钮的禁用状态。</p>
    <t-space direction="vertical">
      <t-space>
        <t-button type="primary" [disabled]="true">Primary</t-button>
        <t-button [disabled]="true">Default</t-button>
        <t-button type="dashed" [disabled]="true">Dashed</t-button>
        <t-button type="outline" [disabled]="true">Outline</t-button>
        <t-button type="text" [disabled]="true">Text</t-button>
      </t-space>
      <t-space>
        <t-button type="primary" status="success" [disabled]="true">Primary</t-button>
        <t-button status="success" [disabled]="true">Default</t-button>
        <t-button type="dashed" status="success" [disabled]="true">Dashed</t-button>
        <t-button type="outline" status="success" [disabled]="true">Outline</t-button>
        <t-button type="text" status="success" [disabled]="true">Text</t-button>
      </t-space>
      <t-space>
        <t-button type="primary" status="warning" [disabled]="true">Primary</t-button>
        <t-button status="warning" [disabled]="true">Default</t-button>
        <t-button type="dashed" status="warning" [disabled]="true">Dashed</t-button>
        <t-button type="outline" status="warning" [disabled]="true">Outline</t-button>
        <t-button type="text" status="warning" [disabled]="true">Text</t-button>
      </t-space>
      <t-space>
        <t-button type="primary" status="danger" [disabled]="true">Primary</t-button>
        <t-button status="danger" [disabled]="true">Default</t-button>
        <t-button type="dashed" status="danger" [disabled]="true">Dashed</t-button>
        <t-button type="outline" status="danger" [disabled]="true">Outline</t-button>
        <t-button type="text" status="danger" [disabled]="true">Text</t-button>
      </t-space>
    </t-space>


    <h3 class="description">组合按钮</h3>
    <p class="description">通过 &lt;t-button-group&gt; 组件使按钮以组合方式出现。可用在同级多项操作中。</p>
    <t-button-group type="primary">
      <t-button shape="round"> copy </t-button>
      <t-button shape="round"> cut </t-button>
      <t-button shape="round"> find </t-button>
    </t-button-group>
    <t-button-group type="outline" [disabled]="true">
      <t-button shape="round"> copy </t-button>
      <t-button shape="round"> cut </t-button>
      <t-button shape="round"> find </t-button>
    </t-button-group>
    <t-button-group type="dashed">
      <t-button shape="round"> copy </t-button>
      <t-button shape="round"> cut </t-button>
      <t-button shape="round"> find </t-button>
    </t-button-group>

    <h3 class="description">API</h3>
    <api-table component="TButton" />
    <api-table component="TButtonGroup" />
  `,
  styles: [

  ]
})
export class ButtonDocs {

}
