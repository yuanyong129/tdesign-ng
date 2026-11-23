import { Component } from '@angular/core';
import { TTagInputModule, type TagInputValue } from '@tdesign-ng/components';

@Component({
  selector: 'demo-tag-input-max',
  imports: [TTagInputModule],
  template: `
    <t-tag-input [(value)]="limited" [max]="3" placeholder="最多添加 3 个标签" [clearable]="true" />
    <t-tag-input [(value)]="collapsed" [minCollapsedNum]="2" placeholder="超出后折叠显示" />
    <p class="demo-hint">限长标签 {{ limited.length }} 个，折叠标签 {{ collapsed.length }} 个。</p>
  `,
})
export class DemoTagInputMax {
  protected limited: TagInputValue = ['标签一'];

  protected collapsed: TagInputValue = ['Vue', 'React', 'Angular', 'Svelte'];
}
