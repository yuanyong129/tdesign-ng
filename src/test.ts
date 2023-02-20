import { FASTElement, customElement, html } from '@microsoft/fast-element';
import { provideArcoDesignSystem } from './arco-design-system';
import { arcoButton } from  './components/button';

provideArcoDesignSystem().register(arcoButton());

const template = html<Test>`
  <a-button>你好</a-button>
`;

@customElement({
  name: 'global-test',
  template
})
export class Test extends FASTElement {

}