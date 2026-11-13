import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoInputBasic } from './demos/input-basic';
import { DemoInputClearable } from './demos/input-clearable';
import { DemoInputIcon } from './demos/input-icon';
import { DemoInputLabel } from './demos/input-label';
import { DemoInputLimit } from './demos/input-limit';
import { DemoInputSize } from './demos/input-size';
import { DemoInputState } from './demos/input-state';
import { DemoInputStatus } from './demos/input-status';

@Component({
  selector: 'input-docs',
  imports: [
    ApiTable,
    DemoBlock,
    PageNav,
    DemoInputBasic,
    DemoInputSize,
    DemoInputClearable,
    DemoInputIcon,
    DemoInputLabel,
    DemoInputStatus,
    DemoInputLimit,
    DemoInputState,
  ],
  template: `
    <div class="docs-page">
      <h1 class="docs-page__title">输入框 Input</h1>
      <p class="docs-page__lead">
        输入框用于接收用户的单行文本，支持前缀/后缀图标、清空、字数限制与四种状态。
      </p>

      <docs-demo id="input-basic" title="基础输入框" description="最简单的用法，通过 [(value)] 双向绑定。">
        <demo-input-basic />
      </docs-demo>

      <docs-demo id="input-size" title="尺寸" description="尺寸有 small、medium（默认）、large 三档。">
        <demo-input-size />
      </docs-demo>

      <docs-demo id="input-label" title="带标签的输入框" description="label 会渲染成关联的原生 label，点击可聚焦输入框。">
        <demo-input-label />
      </docs-demo>

      <docs-demo id="input-clearable" title="可清空" description="设置 clearable 后，有内容时右侧出现清空图标。">
        <demo-input-clearable />
      </docs-demo>

      <docs-demo id="input-icon" title="前后缀图标" description="用 tInputPrefixIcon / tInputSuffixIcon 标记投影到输入框两侧。">
        <demo-input-icon />
      </docs-demo>

      <docs-demo id="input-status" title="状态与提示" description="status 支持 default、success、warning、error，tips 显示提示文字。">
        <demo-input-status />
      </docs-demo>

      <docs-demo id="input-limit" title="字数限制" description="maxcharacter 按字符截断，配合 showLimitNumber 显示计数。">
        <demo-input-limit />
      </docs-demo>

      <docs-demo id="input-state" title="禁用、只读与无边框" description="disabled 不可交互；readonly 可选中不可改；borderless 去掉边框。">
        <demo-input-state />
      </docs-demo>

      <h2 class="docs-section__title" id="input-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TInput" />
      </div>

      <docs-page-nav current="/input" />
    </div>
  `,
})
export class InputDocs {}
