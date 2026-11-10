import { Component } from '@angular/core';
import { ApiTable } from '../../api/api-table.component';
import { DemoBlock } from '../demo-block';
import { PageNav } from '../page-nav';
import { DemoButtonBlock } from './demos/button-block';
import { DemoButtonDisabled } from './demos/button-disabled';
import { DemoButtonGhost } from './demos/button-ghost';
import { DemoButtonIcon } from './demos/button-icon';
import { DemoButtonLink } from './demos/button-link';
import { DemoButtonShape } from './demos/button-shape';
import { DemoButtonSize } from './demos/button-size';
import { DemoButtonTheme } from './demos/button-theme';
import { DemoButtonThemeVariant } from './demos/button-theme-variant';
import { DemoButtonVariant } from './demos/button-variant';

@Component({
  selector: 'button-docs',
  imports: [
    ApiTable,
    DemoBlock,
    PageNav,
    DemoButtonVariant,
    DemoButtonTheme,
    DemoButtonThemeVariant,
    DemoButtonShape,
    DemoButtonSize,
    DemoButtonBlock,
    DemoButtonGhost,
    DemoButtonIcon,
    DemoButtonDisabled,
    DemoButtonLink,
  ],
  template: `
    <div class="docs-page">
      <h1 class="docs-page__title">按钮 Button</h1>
      <p class="docs-page__lead">
        按钮用于开始一个即时操作，标记了一个（或封装一组）操作命令。
      </p>

      <docs-demo id="button-variant" title="基础按钮" description="按钮的四种变体：base（基础）、outline（描边）、dashed（虚线）、text（文本）。">
        <demo-button-variant />
      </docs-demo>

      <docs-demo id="button-theme" title="按钮主题" description="按钮支持五种主题：default、primary、danger、warning、success。">
        <demo-button-theme />
      </docs-demo>

      <docs-demo id="button-theme-variant" title="主题与变体的组合" description="theme 与 variant 可以自由组合。">
        <demo-button-theme-variant />
      </docs-demo>

      <docs-demo id="button-shape" title="按钮形状" description="rectangle 是默认值；square 只放图标；circle 是圆形。">
        <demo-button-shape />
      </docs-demo>

      <docs-demo id="button-size" title="按钮尺寸" description="尺寸有 small、medium（默认）、large 三档。">
        <demo-button-size />
      </docs-demo>

      <docs-demo id="button-block" title="块级按钮" description="设置 block 后按钮占满父容器宽度，常用于移动端表单。">
        <demo-button-block />
      </docs-demo>

      <docs-demo id="button-ghost" title="幽灵按钮" description="幽灵按钮背景透明，通常用于深色背景。注意 default 主题的幽灵按钮文字为白色。" [dark]="true">
        <demo-button-ghost />
      </docs-demo>

      <docs-demo id="button-icon" title="带图标的按钮" description="用 tButtonIcon 投影前置图标、tButtonSuffix 投影后置图标，间距由上游样式自动处理。">
        <demo-button-icon />
      </docs-demo>

      <docs-demo id="button-disabled" title="禁用与加载" description="禁用与加载状态都会阻止点击，并让按钮不可获得焦点。">
        <demo-button-disabled />
      </docs-demo>

      <docs-demo id="button-link" title="链接按钮" description="设置 href 或 tag=&quot;a&quot; 后渲染为锚点元素。">
        <demo-button-link />
      </docs-demo>

      <h2 class="docs-section__title" id="button-api">API</h2>
      <div class="api-table__scroll">
        <api-table component="TButton" />
      </div>

      <docs-page-nav current="/button" />
    </div>
  `,
})
export class ButtonDocs {}
