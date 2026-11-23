import { NgModule } from '@angular/core';
import { TAside } from './aside.component';
import { TContent } from './content.component';
import { TFooter } from './footer.component';
import { THeader } from './header.component';
import { TLayout } from './layout.component';

@NgModule({
  imports: [TLayout, THeader, TAside, TContent, TFooter],
  exports: [TLayout, THeader, TAside, TContent, TFooter],
})
export class TLayoutModule {}
