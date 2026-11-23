import { NgModule } from '@angular/core';
import { TParagraph } from './paragraph.component';
import { TText } from './text.component';
import { TTitle } from './title.component';

/** 排版三件套：t-text / t-title / t-paragraph。 */
@NgModule({
  imports: [TText, TTitle, TParagraph],
  exports: [TText, TTitle, TParagraph],
})
export class TypographyModule {}
