import { FASTElement, customElement, html, css } from '@microsoft/fast-element';
import { provideArcoDesignSystem, arcoButton, arcoSpace } from './index';

provideArcoDesignSystem().register(arcoButton(), arcoSpace());

const template = html<Test>`
  <div> 测试用代码 </div>
  <div class="button-demo">
    <div>按钮大小</div>
    <a-button type="primary" size="mini">Primary</a-button>
    <a-button type="primary" size="small">Primary</a-button>
    <a-button type="primary" size="medium">Primary</a-button>
    <a-button type="primary" size="large">Primary</a-button>
  </div>
  <div class="button-demo">
    <div>按钮样式</div>
    <a-button type="primary">Primary</a-button>
    <a-button >Secondary</a-button>
    <a-button type="dashed">Dashed</a-button>
    <a-button type="outline">Outline</a-button>
    <a-button type="text">Text</a-button>
  </div>
  <div class="button-demo">
    <div>按钮状态</div>
    <a-space>
      <a-button type="primary" status="success">Primary</a-button>
      <a-button status="success" >Secondary</a-button>
      <a-button type="dashed" status="success">Dashed</a-button>
      <a-button type="outline" status="success">Outline</a-button>
      <a-button type="text" status="success">Text</a-button>
    </a-space>
    <a-space>
      <a-button type="primary" status="warning">Primary</a-button>
      <a-button status="warning">Secondary</a-button>
      <a-button type="dashed" status="warning">Dashed</a-button>
      <a-button type="outline" status="warning">Outline</a-button>
      <a-button type="text" status="warning">Text</a-button>
    </a-space>
    <a-space>
      <a-button type="primary" status="danger">Primary</a-button>
      <a-button status="danger" >Secondary</a-button>
      <a-button type="dashed" status="danger">Dashed</a-button>
      <a-button type="outline" status="danger">Outline</a-button>
      <a-button type="text" status="danger">Text</a-button>
    </a-space>
  </div>
  <div>
    <div>间距</div>
    <a-space>
      <a-button type="outline">Outline</a-button>
      <a-button size="large">Primary</a-button>
    </a-space>
  </div>
`;

const styles = css`
  .button-demo a-button {
    margin-top: 10px;
    margin-right: 8px;
  }
`;

@customElement({
  name: 'global-test',
  template,
  styles
})
export class Test extends FASTElement {

}