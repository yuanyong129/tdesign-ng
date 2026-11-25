import { Directive, ElementRef, effect, inject, input } from '@angular/core';

/** 属性名归一化：`className` → `class`，`styleName` 之类不处理。 */
function normalizeName(name: string): string {
  return name === 'className' ? 'class' : name;
}

/** 类名取值归一化，支持字符串 / 数组 / 对象。 */
function classTokensOf(value: unknown): string[] {
  if (value === undefined || value === null || value === false) return [];
  if (typeof value === 'string') return value.split(/\s+/).filter(Boolean);
  if (Array.isArray(value)) return value.flatMap((item) => classTokensOf(item));
  if (typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .filter(([, enabled]) => !!enabled)
      .map(([name]) => name);
  }
  return [String(value)];
}

/** 样式取值归一化，支持对象与 `a: b; c: d` 形式的字符串。 */
function styleEntriesOf(value: unknown): Array<[string, string]> {
  if (value === undefined || value === null || value === false) return [];
  if (typeof value === 'string') {
    return value
      .split(';')
      .map((declaration) => declaration.split(':'))
      .filter((parts) => parts.length === 2)
      .map(([name, val]) => [name.trim(), val.trim()] as [string, string])
      .filter(([name, val]) => !!name && !!val);
  }
  if (typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .filter(([, val]) => val !== undefined && val !== null && val !== false)
      .map(([name, val]) => [name, String(val)]);
  }
  return [];
}

/**
 * 把「属性名 → 取值」对象写到宿主元素上，供 `TTable` 的 `rowAttributes` 使用。
 *
 * Angular 模板无法按运行时属性名做绑定，这里逐条 `setAttribute`；`class` 与
 * `style` 走增量处理（只回收自己加过的类名 / 样式），避免覆盖组件自己的绑定。
 * 不直接用 `[attr]` 之类的整属性赋值，是因为宿主上通常已经有 `[class]` 绑定。
 */
@Directive({
  selector: '[tTableRowAttributes]',
  standalone: true,
})
export class TTableRowAttributes {
  /** 属性名 → 取值。`undefined` / `null` / `false` 表示移除该属性 */
  readonly tTableRowAttributes = input<Record<string, unknown> | null | undefined>(null);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** 已经写上去的属性值，用于下次变更时按需移除。 */
  private readonly appliedAttributes = new Map<string, string>();

  /** 自己加过的类名，变更时只回收这些。 */
  private readonly appliedClasses = new Set<string>();

  /** 自己设置过的样式属性名，变更时只回收这些。 */
  private readonly appliedStyles = new Set<string>();

  constructor() {
    effect(() => {
      this.apply(this.tTableRowAttributes());
    });
  }

  private get element(): HTMLElement {
    return this.host.nativeElement;
  }

  private apply(attributes: Record<string, unknown> | null | undefined): void {
    const classNames = new Set<string>();
    const styles = new Map<string, string>();
    const nextAttributes = new Map<string, string>();

    for (const [rawName, value] of Object.entries(attributes ?? {})) {
      const name = normalizeName(rawName);
      if (name === 'class') {
        for (const token of classTokensOf(value)) classNames.add(token);
        continue;
      }
      if (name === 'style') {
        for (const [prop, val] of styleEntriesOf(value)) styles.set(prop, val);
        continue;
      }
      if (value === undefined || value === null || value === false) continue;
      nextAttributes.set(name, String(value));
    }

    for (const [name, previous] of this.appliedAttributes) {
      if (nextAttributes.has(name)) continue;
      // 值被别人改过就不动，避免误删外部写入的属性
      if (this.element.getAttribute(name) === previous) this.element.removeAttribute(name);
      this.appliedAttributes.delete(name);
    }
    for (const [name, value] of nextAttributes) {
      if (this.appliedAttributes.get(name) === value) continue;
      this.element.setAttribute(name, value);
      this.appliedAttributes.set(name, value);
    }

    for (const token of this.appliedClasses) {
      if (classNames.has(token)) continue;
      this.element.classList.remove(token);
      this.appliedClasses.delete(token);
    }
    for (const token of classNames) {
      if (this.appliedClasses.has(token)) continue;
      this.element.classList.add(token);
      this.appliedClasses.add(token);
    }

    for (const prop of this.appliedStyles) {
      if (styles.has(prop)) continue;
      this.element.style.removeProperty(prop);
      this.appliedStyles.delete(prop);
    }
    for (const [prop, value] of styles) {
      this.element.style.setProperty(prop, value);
      this.appliedStyles.add(prop);
    }
  }
}
