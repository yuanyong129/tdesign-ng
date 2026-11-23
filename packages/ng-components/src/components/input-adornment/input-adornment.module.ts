import { NgModule } from '@angular/core';
import { TInputAdornment } from './input-adornment.component';

const COMPONENTS = [TInputAdornment];

@NgModule({
  imports: COMPONENTS,
  exports: COMPONENTS,
})
export class TInputAdornmentModule {}
