import { NgModule } from '@angular/core';
import { TCollapse } from './collapse.component';
import { TCollapsePanel } from './collapse-panel.component';

@NgModule({
  imports: [TCollapse, TCollapsePanel],
  exports: [TCollapse, TCollapsePanel],
})
export class TCollapseModule {}
