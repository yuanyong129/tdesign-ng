import { FASTElement, customElement, html, css } from '@microsoft/fast-element';
import { provideArcoDesignSystem, provideArcoIconDesignSystem, allComponents, allIcons } from '../index'
import { FASTRouter } from '@microsoft/fast-router';
import { AppRouterConfiguration } from './router';
import './icon';

FASTRouter;
provideArcoDesignSystem().register(allComponents);
provideArcoIconDesignSystem().register(allIcons);

const template = html<Doucument>`
  <fast-router :config=${x => x.routerConfiguration}></fast-router>
`;

const styles = css`
  
`;

@customElement({
  name: 'arco-design-fast-doucment',
  template,
  styles
})
export class Doucument extends FASTElement {
    routerConfiguration = new AppRouterConfiguration();
}