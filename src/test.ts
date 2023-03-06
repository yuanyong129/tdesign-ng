import { FASTElement, customElement, html } from '@microsoft/fast-element';
import { provideArcoDesignSystem, provideArcoIconDesignSystem, allComponents, allIcons } from './index';
// import { fastDivider, provideFASTDesignSystem } from '@microsoft/fast-components';

provideArcoDesignSystem().register(allComponents);
provideArcoIconDesignSystem().register(allIcons);

const template = html<Test>`
  <a-space direction="vertical" fill="true">
    测试用代码
    <fast-divider></fast-divider>
    <a-divider></a-divider>
    <div class="button-demo">
      <div>按钮大小</div>
      <a-button type="primary" size="mini">Primary</a-button>
      <a-button type="primary" size="small">Primary</a-button>
      <a-button type="primary" size="medium">Primary</a-button>
      <a-button type="primary" size="large">Primary</a-button>
    </div>
  </a-space>
  <a-divider></a-divider>
  <a-space>
    <div>按钮样式</div>
    <a-divider direction="vertical"></a-divider>
    <a-button type="primary">Primary</a-button>
    <a-button >Secondary</a-button>
    <a-button type="dashed">Dashed</a-button>
    <a-button type="outline">Outline</a-button>
    <a-button type="text">Text</a-button>
  </a-space>
  <a-divider></a-divider>
  <a-space class="button-demo" direction="vertical">
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
  </a-space>

  <div>
    <a-space align="center">
      Space:
      <div>bb</div>
      cc
      <span>dd</span>
      ee &nbsp;
      <a-button status="danger" >Secondary</a-button>
      <icon-loading></icon-loading>
    </a-space>
  </div>
`;

@customElement({
  name: 'global-test',
  template,
})
export class Test extends FASTElement {

}