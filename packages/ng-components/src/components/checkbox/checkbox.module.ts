import { NgModule } from '@angular/core';
import { TCheckbox } from './checkbox.component';
import { TCheckboxGroup } from './checkbox-group.component';

@NgModule({
  imports: [TCheckbox, TCheckboxGroup],
  exports: [TCheckbox, TCheckboxGroup],
})
export class TCheckboxModule {}
