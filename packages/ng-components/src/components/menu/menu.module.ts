import { NgModule } from '@angular/core';
import { TMenuGroup } from './menu-group.component';
import { TMenuItem } from './menu-item.component';
import { TMenu } from './menu.component';
import { TSubmenu } from './submenu.component';

/** 导航菜单模块。 @zh 导航菜单模块 @en Menu module */
@NgModule({
  imports: [TMenu, TMenuItem, TSubmenu, TMenuGroup],
  exports: [TMenu, TMenuItem, TSubmenu, TMenuGroup],
})
export class TMenuModule {}
