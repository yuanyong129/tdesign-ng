
import type { Container } from '@microsoft/fast-foundation';
import * as generalOutlineTemplates from './templates/general';
export * from './templates/general';

export const allIcons: Record<string, Function> = {
  ...generalOutlineTemplates,
  register(container?: Container, ...rest: any[]) {
    if (!container) {
      return;
    }

    for (const key in this) {
      if (key === 'register') {
        continue;
      }

      this[key]().register(container, ...rest);
    }
  },
}