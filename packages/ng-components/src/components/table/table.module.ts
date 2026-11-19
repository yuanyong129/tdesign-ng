import { NgModule } from '@angular/core';
import { TTableCell } from './table-cell.directive';
import { TTable } from './table.component';

@NgModule({
  imports: [TTable, TTableCell],
  exports: [TTable, TTableCell],
})
export class TTableModule {}
