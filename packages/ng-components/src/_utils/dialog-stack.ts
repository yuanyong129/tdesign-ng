import { signal } from '@angular/core';
import type { BlockScrollStrategy } from '@angular/cdk/overlay';

export interface DialogLayer { key: object; zIndex: number; element: () => HTMLElement | null; }
const stacks = new WeakMap<Document, ReturnType<typeof createStack>>();
function createStack() { return signal<DialogLayer[]>([]); }
export function dialogStack(document: Document) {
  let stack = stacks.get(document);
  if (!stack) { stack = createStack(); stacks.set(document, stack); }
  return stack;
}
export const handledDialogKeys = new WeakSet<KeyboardEvent>();

const locks = new WeakMap<Document, { count: number; strategy: BlockScrollStrategy | null }>();
/** Share one CDK strategy across Dialog instances, preserving an existing external lock. */
export function lockDialogScroll(document: Document, create: () => BlockScrollStrategy): () => void {
  let lock = locks.get(document);
  if (!lock) {
    const strategy = document.documentElement.classList.contains('cdk-global-scrollblock') ? null : create();
    strategy?.attach(); strategy?.enable();
    lock = { count: 0, strategy }; locks.set(document, lock);
  }
  lock.count++;
  const acquired = lock;
  let released = false;
  return () => {
    if (released) return;
    released = true;
    if (--acquired.count) return;
    acquired.strategy?.disable(); locks.delete(document);
  };
}
