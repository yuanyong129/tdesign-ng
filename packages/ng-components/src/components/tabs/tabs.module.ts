import { NgModule } from '@angular/core';
import { TTabPanel } from './tab-panel.component';
import { TTabs } from './tabs.component';

@NgModule({
  imports: [TTabs, TTabPanel],
  exports: [TTabs, TTabPanel],
})
export class TTabsModule {}
