import { NgModule } from '@angular/core';
import { TCascader } from './cascader.component';
import {
  TCascaderPanelBottom,
  TCascaderPanelTop,
  TCascaderValueDisplay,
} from './cascader-content.directives';

@NgModule({
  imports: [TCascader, TCascaderPanelTop, TCascaderPanelBottom, TCascaderValueDisplay],
  exports: [TCascader, TCascaderPanelTop, TCascaderPanelBottom, TCascaderValueDisplay],
})
export class TCascaderModule {}
