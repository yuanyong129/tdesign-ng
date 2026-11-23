import { Component } from '@angular/core';
import { TypographyModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-typography-paragraph',
  imports: [TypographyModule],
  template: `
    <t-paragraph content="用 content 输入传入的段落：排版组件把文本、标题与段落统一在同一套视觉规范里。" />
    <t-paragraph>用默认插槽传入的段落，与 content 写法等价。</t-paragraph>

    <t-paragraph [ellipsis]="true">
      单行省略：这段文字故意写得很长很长，用来验证单行截断——超出容器宽度时应该只显示一行，并在末尾出现省略号，而不是换行。
    </t-paragraph>

    <t-paragraph [ellipsis]="{ row: 2 }">
      多行省略（row: 2）：这段文字同样故意写得很长，用来验证两行截断。第一行、第二行都放满之后，第三行及以后的内容会被裁掉，
      末尾出现省略号。可以把它想象成一段产品介绍或者列表里的摘要文案，既希望展示更多信息，又不能让整块内容无限长下去。
    </t-paragraph>

    <p class="demo-hint">
      ellipsis 传 true 时按单行截断，传 &#123; row: 2 &#125; 这种对象形式时最多显示两行；截断用的布局量走内联 style，颜色、字号与间距仍来自组件样式。
    </p>
  `,
})
export class DemoTypographyParagraph {}
