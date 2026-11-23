import { Component } from '@angular/core';
import { TSpaceModule, TYPOGRAPHY_THEMES, TypographyModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-typography-base',
  imports: [TypographyModule, TSpaceModule],
  template: `
    <t-space direction="vertical" [size]="8">
      <t-text>这是一段普通文本。</t-text>
      <t-text [strong]="true">加粗文本</t-text>
      <t-text [italic]="true">斜体文本</t-text>
      <t-text [underline]="true">下划线文本</t-text>
      <t-text [delete]="true">删除线文本</t-text>
      <t-text [code]="true">code 代码样式</t-text>
      <t-text [keyboard]="true">Ctrl + K</t-text>
      <t-text [mark]="true">默认标记底色</t-text>
      <t-text mark="rgba(0, 82, 217, 0.25)">自定义标记底色</t-text>
      <t-text [strong]="true" [underline]="true" [mark]="true">组合装饰：加粗 + 下划线 + 标记</t-text>
    </t-space>

    <t-space direction="vertical" [size]="8">
      @for (theme of themes; track theme) {
        <t-text [theme]="theme">{{ theme }} 主题文本</t-text>
      }
      <t-text [disabled]="true">禁用文本：theme 会被 disabled 覆盖</t-text>
    </t-space>

    <p class="demo-hint">
      strong / italic / underline / delete / code / keyboard / mark 都是装饰类属性，可以自由组合；mark 传字符串时会作为标记的背景色。
      theme 可选 primary / secondary / success / warning / error，disabled 优先于 theme。
    </p>
  `,
})
export class DemoTypographyBase {
  protected readonly themes = TYPOGRAPHY_THEMES;
}
