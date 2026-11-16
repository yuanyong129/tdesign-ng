import { Component } from '@angular/core';
import { TButtonModule, TSpaceModule, TTagModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-tag-closable',
  imports: [TTagModule, TButtonModule, TSpaceModule],
  template: `
    <t-space direction="vertical" [size]="12">
      <t-space [size]="12">
        @for (tag of tags; track tag) {
          <t-tag [closable]="true" theme="primary" variant="light" (close)="remove(tag)">{{ tag }}</t-tag>
        }
      </t-space>
      <t-space [size]="12">
        <t-tag [closable]="true" [disabled]="true">禁用不可关闭</t-tag>
        <t-button variant="text" (click)="reset()">重置</t-button>
      </t-space>
    </t-space>
    <p class="demo-hint">关闭会触发 (close)，由使用方决定是否移除。</p>
  `,
})
export class DemoTagClosable {
  private readonly all = ['标签一', '标签二', '标签三'];

  protected tags = [...this.all];

  protected remove(tag: string): void {
    this.tags = this.tags.filter((item) => item !== tag);
  }

  protected reset(): void {
    this.tags = [...this.all];
  }
}
