import { Component } from '@angular/core';
import { TypographyModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-typography-slot',
  imports: [TypographyModule],
  template: `
    <ng-template #richParagraph>
      段落内容也可以是模板：这里同时放了 <strong>加粗</strong>、<t-text [mark]="true">标记</t-text> 与
      <t-text [code]="true">code</t-text>，它们依然遵守同一套排版样式。
    </ng-template>

    <ng-template #richText>
      行内富文本：<t-text [underline]="true">带下划线的文字</t-text>、<t-text [keyboard]="true">Ctrl + S</t-text>
    </ng-template>

    <t-paragraph [content]="richParagraph" />
    <t-text [content]="richText" />

    <p class="demo-hint">
      content 同时接受字符串与 TemplateRef：传模板引用时用 *ngTemplateOutlet 渲染，因此可以在内容里再放组件。
    </p>
  `,
})
export class DemoTypographySlot {}
