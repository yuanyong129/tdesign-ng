import { NgModule } from '@angular/core';
import { TTimePicker } from './time-picker.component';
import { TTimePickerValueDisplay } from './time-picker-content.directives';

@NgModule({
  imports: [TTimePicker, TTimePickerValueDisplay],
  exports: [TTimePicker, TTimePickerValueDisplay],
})
export class TTimePickerModule {}
