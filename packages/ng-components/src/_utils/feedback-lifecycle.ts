import { DestroyRef, effect, inject, signal } from '@angular/core';

/** A feedback item closes once; hover restarts the full duration on leave. */
export function createFeedbackLifecycle(duration: () => number, finish: (expired: boolean, alive: () => boolean) => void) {
  const closed = signal(false);
  const hovered = signal(false);
  let destroyed = false;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const clear = () => { if (timer !== undefined) clearTimeout(timer); timer = undefined; };
  const close = (expired = false) => {
    if (destroyed || closed()) return false;
    clear(); closed.set(true); finish(expired, () => !destroyed); return true;
  };
  effect((cleanup) => {
    const milliseconds = duration();
    if (!closed() && !hovered() && Number.isFinite(milliseconds) && milliseconds > 0) {
      timer = setTimeout(() => close(true), milliseconds);
    }
    cleanup(clear);
  });
  inject(DestroyRef).onDestroy(() => { destroyed = true; clear(); });
  return { closed: closed.asReadonly(), close,
    pause: () => { clear(); hovered.set(true); }, resume: () => hovered.set(false) };
}
