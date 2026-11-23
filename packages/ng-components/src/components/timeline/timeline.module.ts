import { NgModule } from '@angular/core';
import { TTimeline } from './timeline.component';
import { TTimelineItem } from './timeline-item.component';

@NgModule({
  imports: [TTimeline, TTimelineItem],
  exports: [TTimeline, TTimelineItem],
})
export class TTimelineModule {}
