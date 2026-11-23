import { Component } from '@angular/core';
import { TypographyModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-typography-title',
  imports: [TypographyModule],
  template: `
    <t-title level="h1">一级标题</t-title>
    <t-title level="h2">二级标题</t-title>
    <t-title level="h3">三级标题</t-title>
    <t-title level="h4">四级标题</t-title>
    <t-title level="h5">五级标题</t-title>
    <t-title level="h6">六级标题</t-title>

    <t-title level="h3" content="用 content 输入传入标题文案" />
    <t-title level="h4" [ellipsis]="true">
      标题也支持省略：这句标题很长，单行放不下时会按 ellipsis 截断并显示省略号
    </t-title>

    <p class="demo-hint">
      level 取 h1 ~ h6，直接渲染对应的原生标题标签，字号与上下间距随层级递减；content 与默认插槽两种写法等价，
      省略只做静态 CSS 截断。
    </p>
  `,
})
export class DemoTypographyTitle {}
