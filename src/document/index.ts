import { FASTElement, customElement, html, css } from '@microsoft/fast-element';
import { provideArcoDesignSystem, provideArcoIconDesignSystem, allComponents, allIcons } from '../index'
import { FASTRouter, Route, Router } from '@microsoft/fast-router';
import { AppRouterConfiguration } from './router';
import './icon';

FASTRouter;
provideArcoDesignSystem().register(allComponents);
provideArcoIconDesignSystem().register(allIcons);

const template = html<Doucument>`
  <a-space>
    <a-button type="primary">Button 按钮</a-button>
    <a-button type="primary">Icons 图标</a-button>
  </a-space>
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

  onRouteChange(path: string) {
    (path);
  }
}