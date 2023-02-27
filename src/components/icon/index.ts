
import type { Container } from '@microsoft/fast-foundation';
import { arcoIcon } from './icon';

export {
  arcoIcon
}

export const allIcons: Record<string, Function> = {
  arcoIcon,
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