import { NgModule } from '@angular/core';
import { TForm } from './form.component';
import { TFormItem } from './form-item.component';

@NgModule({
  imports: [TForm, TFormItem],
  exports: [TForm, TFormItem],
})
export class TFormModule {}
