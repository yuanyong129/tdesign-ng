/**
 * 处理类名的工具函数
 */

type ClassValue = string | number | boolean | null | undefined | Record<string, any>;

export function cn(...classes: ClassValue[]): string {
  const classList: string[] = [];

  for (const arg of classes) {
    if (!arg) continue;

    if (typeof arg === 'string' || typeof arg === 'number') {
      classList.push(String(arg));
    } else if (Array.isArray(arg)) {
      classList.push(cn(...arg));
    } else if (typeof arg === 'object') {
      for (const key in arg) {
        if (arg[key]) {
          classList.push(key);
        }
      }
    }
  }

  return classList.join(' ');
}
