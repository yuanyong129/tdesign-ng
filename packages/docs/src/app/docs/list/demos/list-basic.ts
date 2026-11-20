import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TList, TListItem, TListItemMeta } from '@tdesign-ng/components';

const avatar = (letter: string, color: string): string =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><rect width="40" height="40" fill="${color}"/><text x="20" y="26" font-size="16" fill="#fff" text-anchor="middle">${letter}</text></svg>`,
  )}`;

@Component({
  selector: 'demo-list-basic',
  standalone: true,
  imports: [TList, TListItem, TListItemMeta],
  template: `
    <t-list header="文件列表" footer="共 3 个文件">
      <t-list-item>
        <t-list-item-meta
          [image]="avatars[0]"
          title="课件.pdf"
          description="张老师 上传于 2026-11-18" />
      </t-list-item>
      <t-list-item>
        <t-list-item-meta
          [image]="avatars[1]"
          title="作业汇总.docx"
          description="李老师 上传于 2026-11-17" />
      </t-list-item>
      <t-list-item>
        <t-list-item-meta
          [image]="avatars[2]"
          title="成绩单.xlsx"
          description="王老师 上传于 2026-11-16" />
      </t-list-item>
    </t-list>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DemoListBasic {
  protected readonly avatars = [avatar('Z', '#0052d9'), avatar('L', '#00a870'), avatar('W', '#ed7b2f')];
}
