import { NgModule } from '@angular/core';
import { TBreadcrumb } from './breadcrumb.component';
import { TBreadcrumbItem } from './breadcrumb-item.component';

/** 面包屑模块，同时导出父容器与子项。 */
@NgModule({
  imports: [TBreadcrumb, TBreadcrumbItem],
  exports: [TBreadcrumb, TBreadcrumbItem],
})
export class TBreadcrumbModule {}
