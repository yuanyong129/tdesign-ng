import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Renderer2,
  effect,
  inject,
  input,
} from '@angular/core';
import { TD_ICONS } from './icons.generated';

/** 解析后的 icon 源缓存，避免每次渲染都重新 parse。 */
const parsedCache = new Map<string, SVGSVGElement>();

function warnMissing(name: string): void {
  if (typeof console === 'undefined') return;
  console.warn(
    `[tdesign-ng] 未找到名为 "${name}" 的图标。默认只内置常用图标集，` +
      `如需全量图标请执行：pnpm gen:icons --all`,
  );
}

/**
 * 把图标片段解析成 SVG 元素。片段来自上游图标源码（可信），因此不经过 innerHTML，
 * 也不会触发 Angular 的 sanitizer。
 */
function createSvgElement(name: string, viewBox: string, content: string): SVGSVGElement | null {
  if (typeof document === 'undefined' || typeof DOMParser === 'undefined') return null;

  let source = parsedCache.get(name);
  if (!source) {
    const doc = new DOMParser().parseFromString(
      `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}">${content}</svg>`,
      'image/svg+xml',
    );
    source = doc.documentElement as unknown as SVGSVGElement;
    if (!source || source.nodeName === 'parsererror') {
      console.warn(`[tdesign-ng] 图标 "${name}" 的 SVG 片段解析失败`);
      return null;
    }
    parsedCache.set(name, source);
  }

  const svg = document.importNode(source, true) as SVGSVGElement;
  svg.setAttribute('width', '1em');
  svg.setAttribute('height', '1em');
  svg.setAttribute('fill', 'currentColor');
  svg.setAttribute('focusable', 'false');
  svg.setAttribute('aria-hidden', 'true');
  return svg;
}

/**
 * 图标。
 *
 * 图标名与上游保持一致，可直接照抄 TDesign 文档：
 * ```html
 * <t-icon name="add" />
 * <t-icon name="loading" size="24px" />
 * ```
 *
 * 颜色通过 CSS `color` 控制（`fill: currentcolor`），尺寸通过 `size` 或 `font-size` 控制。
 */
@Component({
  selector: 't-icon',
  standalone: true,
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: 't-icon',
  },
})
export class TIcon {
  /** @zh 图标名称 @en Icon name */
  readonly name = input.required<string>();

  /** @zh 图标尺寸，支持任意 CSS 长度，默认继承字号 @en Icon size, supports any CSS length @defaultValue undefined */
  readonly size = input<string | undefined>(undefined);

  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly renderer = inject(Renderer2);
  private renderedName: string | null = null;
  private renderedSvg: SVGSVGElement | null = null;

  constructor() {
    effect(() => {
      const name = this.name();
      this.applySize(this.size());
      this.applyName(name);
    });
  }

  private applySize(size: string | undefined): void {
    const style = this.host.nativeElement.style;
    if (size) style.fontSize = /^\d+(\.\d+)?$/.test(size) ? `${size}px` : size;
    else style.removeProperty('font-size');
  }

  private applyName(name: string): void {
    if (this.renderedName === name) return;

    const host = this.host.nativeElement;
    if (this.renderedSvg) {
      this.renderer.removeChild(host, this.renderedSvg);
      this.renderedSvg = null;
    }
    if (this.renderedName) this.renderer.removeClass(host, `t-icon-${this.renderedName}`);
    this.renderedName = name;

    const source = TD_ICONS[name];
    if (!source) {
      warnMissing(name);
      return;
    }

    const svg = createSvgElement(name, source.viewBox, source.content);
    if (!svg) return;

    this.renderer.addClass(host, `t-icon-${name}`);
    this.renderer.appendChild(host, svg);
    this.renderedSvg = svg;
  }
}
