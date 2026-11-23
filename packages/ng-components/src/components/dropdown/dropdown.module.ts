import { NgModule } from '@angular/core';
import { TDropdown } from './dropdown.component';
import { TDropdownItem } from './dropdown-item.component';

@NgModule({
  imports: [TDropdown, TDropdownItem],
  exports: [TDropdown, TDropdownItem],
})
export class TDropdownModule {}
