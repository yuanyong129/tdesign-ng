import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoRadioBasic } from './demos/radio-basic';
import { DemoRadioButton } from './demos/radio-button';
import { DemoRadioDirection } from './demos/radio-direction';
import { DemoRadioFilled } from './demos/radio-filled';
import { DemoRadioGroup } from './demos/radio-group';
import { DemoRadioOptions } from './demos/radio-options';
import { DemoRadioState } from './demos/radio-state';

@Component({
  selector: 'radio-docs',
  imports: [
    ApiTable,
    DemoBlock,
    PageNav,
    DemoRadioBasic,
    DemoRadioGroup,
    DemoRadioOptions,
    DemoRadioButton,
    DemoRadioFilled,
    DemoRadioDirection,
    DemoRadioState,
  ],
  template: `
    <div class="docs-page">
      <h1 class="docs-page__title">单选框 Radio</h1>
      <p class="docs-page__lead">
        单选框用于在多个互斥的选项中选中一个，配合 t-radio-group 使用可以整组取值。
      </p>

      <docs-demo id="radio-basic" title="基础用法" description="单独使用时通过 [checked] 控制选中状态。">
        <demo-radio-basic />
      </docs-demo>

      <docs-demo id="radio-group" title="单选框组" description="用内容投影声明子项，整组用 [(value)] 绑定选中的值。">
        <demo-radio-group />
      </docs-demo>

      <docs-demo id="radio-options" title="选项配置" description="也可以用 options 传入选项数组，支持单独禁用某一项。">
        <demo-radio-options />
      </docs-demo>

      <docs-demo id="radio-button" title="按钮式" description="theme=&quot;button&quot; 把单选框显示为按钮，variant 控制描边或填充。">
        <demo-radio-button />
      </docs-demo>

      <docs-demo id="radio-filled" title="填充变体" description="default-filled 与 primary-filled 用色块跟随选中项移动。">
        <demo-radio-filled />
      </docs-demo>

      <docs-demo id="radio-direction" title="排列方向" description="direction 支持 horizontal（默认）与 vertical。">
        <demo-radio-direction />
      </docs-demo>

      <docs-demo id="radio-state" title="禁用与只读" description="整组或单项都可以禁用，readonly 保持样式但不响应点击。">
        <demo-radio-state />
      </docs-demo>

      <h2 class="docs-section__title" id="radio-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TRadio" />
      </div>
      <div class="api-table__scroll">
        <api-table component="TRadioGroup" />
      </div>

      <docs-page-nav current="/radio" />
    </div>
  `,
})
export class RadioDocs {}
