import { NgModule } from '@angular/core';
import { ArcoButton } from './button.component';
import { ArcoButtonGroup } from './button-group.component';

@NgModule({
  imports: [ArcoButton],
  exports: [ArcoButton]
})
export class ArcoButtonModule {}

@NgModule({
  imports: [ArcoButtonGroup],
  exports: [ArcoButtonGroup]
})
export class ArcoButtonGroupModule {}
