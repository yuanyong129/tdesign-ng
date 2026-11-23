import { Component } from '@angular/core';
import { TAvatarModule, TCardModule } from '@tdesign-ng/components';

/** 封面示例用一张内联 SVG 渐变图，避免示例依赖外部图片资源。 */
const COVER_IMAGE =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='160'%3E%3Cdefs%3E%3ClinearGradient id='g' x1='0' y1='0' x2='1' y2='1'%3E%3Cstop offset='0' stop-color='%230052d6'/%3E%3Cstop offset='1' stop-color='%2300a870'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width='400' height='160' fill='url(%23g)'/%3E%3C/svg%3E";

@Component({
  selector: 'demo-card-cover',
  imports: [TCardModule, TAvatarModule],
  template: `
    <ng-template #avatarTpl>
      <t-avatar>T</t-avatar>
    </ng-template>

    <div style="display: flex; gap: 24px; flex-wrap: wrap">
      <t-card
        style="width: 320px"
        theme="poster2"
        title="封面卡片"
        description="封面由 cover 传入，poster2 主题把操作区放到卡片底部。"
        [cover]="coverImage"
        actions="分享"
      >
        卡片主体内容通过内容投影传入，封面、标题、描述都由属性控制。
      </t-card>

      <t-card
        style="width: 320px"
        [avatar]="avatarTpl"
        title="头像卡片"
        subtitle="副标题"
        description="头部支持头像、标题、副标题与描述。"
        headerBordered
        size="small"
        actions="详情"
      >
        设置 headerBordered 后，卡片头部会显示一条分隔线。
      </t-card>
    </div>
  `,
})
export class DemoCardCover {
  protected readonly coverImage = COVER_IMAGE;
}
