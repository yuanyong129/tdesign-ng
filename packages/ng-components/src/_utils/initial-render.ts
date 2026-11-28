import { afterNextRender, Directive, ElementRef, inject, Renderer2 } from '@angular/core';

/**
 * 初次变更检测前，宿主/子节点可能已经参与样式计算（例如路由恢复滚动位置）。
 * 在初始输入、状态类和布局落定前暂缓 transition，避免从浏览器默认样式动画进入。
 * earlyRead 在全局 write 阶段前统一刷新布局；随后立即恢复过渡，不延迟可交互时间。
 * 只用于组件自有首次渲染，后续状态变化和关键帧动画仍由组件原有样式控制。
 */
@Directive({
  standalone: true,
  host: { 'data-t-initial-render': '' },
})
export class InitialRender {
  constructor() {
    const element = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
    const renderer = inject(Renderer2);
    afterNextRender({
      earlyRead: () => { element.getBoundingClientRect(); },
      write: () => renderer.removeAttribute(element, 'data-t-initial-render'),
    });
  }
}
