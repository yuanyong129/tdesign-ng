import { NgModule } from '@angular/core';
import { TList } from './list.component';
import { TListItem } from './list-item.component';
import { TListItemMeta } from './list-item-meta.component';

@NgModule({
  imports: [TList, TListItem, TListItemMeta],
  exports: [TList, TListItem, TListItemMeta],
})
export class TListModule {}
