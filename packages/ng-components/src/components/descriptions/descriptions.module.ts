import { NgModule } from '@angular/core';
import { TDescriptionItem } from './description-item.component';
import { TDescriptions } from './descriptions.component';

@NgModule({
  imports: [TDescriptions, TDescriptionItem],
  exports: [TDescriptions, TDescriptionItem],
})
export class TDescriptionsModule {}
