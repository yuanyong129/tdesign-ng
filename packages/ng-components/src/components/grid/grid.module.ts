import { NgModule } from '@angular/core';
import { TCol } from './col.component';
import { TRow } from './row.component';

@NgModule({
  imports: [TRow, TCol],
  exports: [TRow, TCol],
})
export class TGridModule {}
