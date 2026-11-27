import { computed, effect, signal, untracked, type Signal } from '@angular/core';

/** 复合表单控件共享：默认值只初始化一次，CVA 写值优先，受控修改只发出提案。 */
export function createControllableState<T>(value: Signal<T | undefined>, defaultValue: () => T) {
  const inner = signal<T>(undefined as T);
  const initialized = signal(false);
  const formsBound = signal(false);
  effect(() => untracked(() => {
    if (!initialized()) {
      inner.set(defaultValue());
      initialized.set(true);
    }
  }));
  const current = computed(() => {
    if (!formsBound() && value() !== undefined) return value() as T;
    return initialized() ? inner() : defaultValue();
  });
  return {
    current,
    set(next: T) { if (formsBound() || value() === undefined) inner.set(next); },
    write(next: T) { formsBound.set(true); initialized.set(true); inner.set(next); },
  };
}
