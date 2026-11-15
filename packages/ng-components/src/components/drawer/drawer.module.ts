import { NgModule } from '@angular/core';
import { TDrawer, TDrawerFooterSlot } from './drawer.component';

@NgModule({
  imports: [TDrawer, TDrawerFooterSlot],
  exports: [TDrawer, TDrawerFooterSlot],
})
export class TDrawerModule {}
