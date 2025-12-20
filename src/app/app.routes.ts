import { Routes } from '@angular/router';
import { ButtonDocs } from './docs/button/button.component';
import { SpaceDocs } from './docs/space/space.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'button',
    pathMatch: 'full'
  },
  {
    path: 'button',
    component: ButtonDocs
  },
  {
    path: 'space',
    component: SpaceDocs
  }
];
