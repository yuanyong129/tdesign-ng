import { FASTElement, customElement, html, css } from '@microsoft/fast-element';
import { provideArcoDesignSystem, arcoButton } from './index';

provideArcoDesignSystem().register(arcoButton());

const template = html<Test>`
  <div> 测试用代码 </div>
  <div>
    <a-button type="outline">Outline</a-button>
    <a-button size="large">Primary</a-button>
  </div>
`;

const styles = css`
  a-button {
    margin-top: 100px;
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