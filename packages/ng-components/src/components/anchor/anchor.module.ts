import { NgModule } from '@angular/core';
import { TAnchor } from './anchor.component';
import { TAnchorItem } from './anchor-item.component';

@NgModule({
  imports: [TAnchor, TAnchorItem],
  exports: [TAnchor, TAnchorItem],
})
export class TAnchorModule {}
