import { Component } from '@angular/core';
import { TTimelineModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-timeline-base',
  imports: [TTimelineModule],
  template: `
    <t-timeline>
      <t-timeline-item label="2024-01-01" content="创建项目" />
      <t-timeline-item label="2024-01-05" content="完成需求评审" dot-color="primary" />
      <t-timeline-item label="2024-01-12" content="开发与联调" />
      <t-timeline-item label="2024-01-20" content="发布上线" dot-color="success" />
    </t-timeline>
  `,
})
export class DemoTimelineBase {}
