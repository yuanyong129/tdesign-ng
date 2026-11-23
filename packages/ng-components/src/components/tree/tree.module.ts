import { NgModule } from '@angular/core';
import { TTree } from './tree.component';
import { TTreeEmptyTemplate, TTreeIconTemplate, TTreeLabelTemplate } from './tree-content.directives';

@NgModule({
  imports: [TTree, TTreeLabelTemplate, TTreeIconTemplate, TTreeEmptyTemplate],
  exports: [TTree, TTreeLabelTemplate, TTreeIconTemplate, TTreeEmptyTemplate],
})
export class TTreeModule {}
