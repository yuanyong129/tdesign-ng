import { NgModule } from '@angular/core';
import { TTreeSelect } from './tree-select.component';
import { TTreeSelectPanelBottom, TTreeSelectPanelTop } from './tree-select-content.directives';

@NgModule({
  imports: [TTreeSelect, TTreeSelectPanelTop, TTreeSelectPanelBottom],
  exports: [TTreeSelect, TTreeSelectPanelTop, TTreeSelectPanelBottom],
})
export class TTreeSelectModule {}
