
import type { Container } from '@microsoft/fast-foundation';
import { loadingTemplate } from './icon.templates';
import { arcoIcon } from './icon';

const iconLoading = arcoIcon('loading', loadingTemplate);

export {
  iconLoading
}

export const allIcons: Record<string, Function> = {
  iconLoading,
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