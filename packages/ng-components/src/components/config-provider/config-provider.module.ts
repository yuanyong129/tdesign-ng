import { NgModule } from '@angular/core';
import { TConfigProvider } from './config-provider.component';

const COMPONENTS = [TConfigProvider];

@NgModule({
  imports: COMPONENTS,
  exports: COMPONENTS,
})
export class TConfigProviderModule {}
