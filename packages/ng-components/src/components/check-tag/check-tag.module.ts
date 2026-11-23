import { NgModule } from '@angular/core';
import { TCheckTag } from './check-tag.component';
import { TCheckTagGroup } from './check-tag-group.component';

@NgModule({
  imports: [TCheckTag, TCheckTagGroup],
  exports: [TCheckTag, TCheckTagGroup],
})
export class TCheckTagModule {}
