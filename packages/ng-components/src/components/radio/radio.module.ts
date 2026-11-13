import { NgModule } from '@angular/core';
import { TRadio } from './radio.component';
import { TRadioGroup } from './radio-group.component';

@NgModule({
  imports: [TRadio, TRadioGroup],
  exports: [TRadio, TRadioGroup],
})
export class TRadioModule {}
