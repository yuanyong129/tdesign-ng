import { Routes } from '@angular/router';
import { ButtonDocs } from './docs/button/button.component';
import { DividerDocs } from './docs/divider/divider.component';
import { LinkDocs } from './docs/link/link.component';
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
    path: 'divider',
    component: DividerDocs
  },
  {
    path: 'link',
    component: LinkDocs
  },
  {
    path: 'scrollbar',
    loadComponent: () => import('./docs/scrollbar/scrollbar.component').then(m => m.ScrollbarDocs)
  },
  {
    path: 'space',
    component: SpaceDocs
  }
];
