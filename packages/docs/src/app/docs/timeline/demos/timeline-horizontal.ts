import { Component } from '@angular/core';
import { TTimelineModule } from '@tdesign-ng/components';

@Component({
  selector: 'demo-timeline-horizontal',
  imports: [TTimelineModule],
  template: `
    <t-timeline layout="horizontal" label-align="top">
      <t-timeline-item label="第一步" content="创建项目" dot-color="primary" />
      <t-timeline-item label="第二步" content="需求评审" />
      <t-timeline-item label="第三步" content="开发联调" />
      <t-timeline-item label="第四步" content="发布上线" dot-color="success" />
    </t-timeline>

    <div style="height: 32px"></div>

    <t-timeline layout="horizontal" label-align="top" reverse>
      <t-timeline-item label="第一步" content="创建项目" dot-color="primary" />
      <t-timeline-item label="第二步" content="需求评审" />
      <t-timeline-item label="第三步" content="开发联调" />
      <t-timeline-item label="第四步" content="发布上线" dot-color="success" />
    </t-timeline>
  `,
})
export class DemoTimelineHorizontal {}
