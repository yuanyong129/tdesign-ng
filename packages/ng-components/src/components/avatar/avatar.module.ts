import { NgModule } from '@angular/core';
import { TAvatar } from './avatar.component';
import { TAvatarGroup } from './avatar-group.component';

@NgModule({
  imports: [TAvatar, TAvatarGroup],
  exports: [TAvatar, TAvatarGroup],
})
export class TAvatarModule {}
