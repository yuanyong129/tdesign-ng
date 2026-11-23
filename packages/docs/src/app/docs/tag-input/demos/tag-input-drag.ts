import { Component } from '@angular/core';
import { TTagInputModule, type TagInputValue } from '@tdesign-ng/components';

@Component({
  selector: 'demo-tag-input-drag',
  imports: [TTagInputModule],
  template: `
    <t-tag-input
      [value]="tags"
      [dragSort]="true"
      (dragSortChange)="tags = $event.newTags"
      placeholder="拖拽标签可调整顺序"
    />
    <p class="demo-hint">当前顺序：{{ tags.join(' / ') }}</p>
  `,
})
export class DemoTagInputDrag {
  protected tags: TagInputValue = ['第一项', '第二项', '第三项'];
}
