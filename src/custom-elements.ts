
import type { Container } from '@microsoft/fast-foundation';
import { arcoButton } from './components/button';
import { arcoSpace } from './components/space';
import { arcoDivider } from './components/divider';

export const allComponents: Record<string, Function> = {
  arcoButton,
  arcoDivider,
  arcoSpace,
  register(container?: Container, ...rest: any[]) {
    if (!container) {
      // preserve backward compatibility with code that loops through
      // the values of this object and calls them as funcs with no args
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