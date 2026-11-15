import { NgModule } from '@angular/core';
import { TDialog, TDialogFooterSlot } from './dialog.component';

@NgModule({
  imports: [TDialog, TDialogFooterSlot],
  exports: [TDialog, TDialogFooterSlot],
})
export class TDialogModule {}
