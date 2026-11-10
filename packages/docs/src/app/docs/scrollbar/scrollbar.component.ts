import { Component } from '@angular/core';
import { TScrollbarModule } from '@tdesign-ng/components';

@Component({
  selector: 'scrollbar-docs',
  imports: [TScrollbarModule],
  template: `
    <h2>滚动条 Scrollbar</h2>
    <p class="description">当内容区域超出容器时，显示滚动条。</p>
    <h3 class="description">基本用法</h3>
    <p class="description">滚动条组件基本用法。scrollbar 的默认插槽需要唯一的子元素。</p>
    <div>
      <t-scrollbar style="width: 500px; height:200px; overflow: auto;">
        <div style="height: 2000px;width: 2000px; background-color: var(--color-primary-light-4);">Content</div>
      </t-scrollbar>
    </div>
  `,
  styles: []
})
export class ScrollbarDocs { }
