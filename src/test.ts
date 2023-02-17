import { FASTElement, customElement, html } from '@microsoft/fast-element';
import './components/button';

const template = html<Test>`
  <a-button>你好</a-button>
`;

@customElement({
  name: 'global-test',
  template
})
export class Test extends FASTElement {

}