import { NgModule } from '@angular/core';
import { TInput } from './input.component';
import { TInputGroup } from './input-group.component';

@NgModule({
  imports: [TInput, TInputGroup],
  exports: [TInput, TInputGroup],
})
export class TInputModule {}
