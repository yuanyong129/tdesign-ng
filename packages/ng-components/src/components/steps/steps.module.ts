import { NgModule } from '@angular/core';
import { TSteps } from './steps.component';
import { TStepItem } from './step-item.component';

/** 步骤条模块，同时导出父容器与子项。 */
@NgModule({
  imports: [TSteps, TStepItem],
  exports: [TSteps, TStepItem],
})
export class TStepsModule {}
