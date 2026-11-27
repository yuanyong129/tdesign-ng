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
import { DemoInputEditing } from './demos/input-editing';
import { DemoInputGroup } from './demos/input-group';

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
    DemoInputEditing,
    DemoInputGroup,
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

      <docs-demo id="input-limit" title="字数限制" description="maxcharacter 按加权长度截断：ASCII 计 1，非 ASCII 每个 UTF-16 单元计 2；maxlength 按 Unicode 码点计数，同时设置时优先。">
        <demo-input-limit />
      </docs-demo>

      <docs-demo id="input-state" title="禁用、只读与无边框" description="disabled 不可交互；readonly 可选中不可改；borderless 去掉边框。">
        <demo-input-state />
      </docs-demo>

      <docs-demo id="input-editing" title="输入状态、事件与自动宽度" description="组合输入结束后统一格式化和截断；validate 通知超限与恢复。defaultValue 仅初始化，value 为受控值，表单 reset 恢复表单默认值。autoWidth 根据内容或占位文字撑宽。">
        <demo-input-editing />
      </docs-demo>
      <p class="demo-hint">inputClass 作用于内层 .t-input，宿主 class 仍用于外层定位。compositionstart/end 输出 value 和 e，paste 输出 e 和 pasteValue，wheel 输出 e 上下文；mouseenter/leave 使用宿主原生事件，范围包含标签和提示区域，参数为 MouseEvent。其余现有焦点与键盘事件保留原生事件参数。粘贴回调可通过 e.preventDefault() 取消默认粘贴。keydown/keyup/keypress 在内部阻止冒泡，避免同名原生事件导致重复回调。不要同时使用 value 与表单绑定。</p>
      <docs-demo id="input-group" title="输入框组合" description="InputGroup 的 separate 控制间距，输入框保持各自的值、焦点及表单状态。">
        <demo-input-group />
      </docs-demo>

      <h2 class="docs-section__title" id="input-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TInput" />
        <api-table component="TInputGroup" />
      </div>

      <docs-page-nav current="/input" />
    </div>
  `,
})
export class InputDocs {}
