import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withInMemoryScrolling } from '@angular/router';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(
      routes,
      // 只用「记住上一页的滚动位置」；锚点滚动由 DocsToc 接管，
      // 因为 Router 的 anchorScrolling 会贴到视口顶部、被 sticky 顶栏盖住。
      withInMemoryScrolling({
        scrollPositionRestoration: 'enabled',
        anchorScrolling: 'disabled',
      }),
    ),
  ],
};
