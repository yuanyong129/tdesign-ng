import { NgModule } from '@angular/core';
import { TButton } from './button.component';
import { TButtonGroup } from './button-group.component';

@NgModule({
  imports: [TButton],
  exports: [TButton]
})
export class TButtonModule {}

@NgModule({
  imports: [TButtonGroup],
  exports: [TButtonGroup]
})
export class TButtonGroupModule {}
