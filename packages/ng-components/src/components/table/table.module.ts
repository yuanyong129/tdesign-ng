import { NgModule } from '@angular/core';
import { TTableCell } from './table-cell.directive';
import { TTableExpandedRow } from './table-expanded-row.directive';
import { TTable } from './table.component';

@NgModule({
  imports: [TTable, TTableCell, TTableExpandedRow],
  exports: [TTable, TTableCell, TTableExpandedRow],
})
export class TTableModule {}
