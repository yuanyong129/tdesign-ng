import { NgModule } from '@angular/core';
import { TEmpty } from './empty.component';
import { TEmptyAction } from './empty-action.directive';

@NgModule({
  imports: [TEmpty, TEmptyAction],
  exports: [TEmpty, TEmptyAction],
})
export class TEmptyModule {}
