import { Component } from '@angular/core';
import { TTimelineModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-timeline-mode',
  imports: [TTimelineModule],
  template: `
    <t-timeline mode="same" theme="dot" label-align="right">
      <t-timeline-item label="2024-01-01 10:00" content="提交申请" dot-color="primary" />
      <t-timeline-item label="2024-01-01 12:30" content="审批中" loading />
      <t-timeline-item label="2024-01-02 09:00" content="审批通过" dot-color="success" />
    </t-timeline>
  `,
})
export class DemoTimelineMode {}
