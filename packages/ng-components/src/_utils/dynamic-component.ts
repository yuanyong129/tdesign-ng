import { ApplicationRef, ComponentRef, EnvironmentInjector, Type, createComponent } from '@angular/core';

/** 动态渲染出来的组件句柄。 */
export interface RenderedComponent<C> {
  /** 组件实例引用 */
  ref: ComponentRef<C>;
  /** 组件宿主元素 */
  host: HTMLElement;
  /** 销毁组件并移除宿主元素 */
  destroy(): void;
}

/**
 * 把组件挂到指定的 DOM 容器里。
 *
 * 服务式调用（message / notification / loading）需要在不依赖模板的情况下创建组件，
 * 这里统一处理 宿主元素创建 → 组件创建 → 视图挂载 → 销毁 的全过程。
 */
export function renderComponent<C>(
  component: Type<C>,
  container: HTMLElement,
  injector: EnvironmentInjector,
  appRef: ApplicationRef,
  hostTag = 'div',
): RenderedComponent<C> {
  const host = document.createElement(hostTag);
  container.appendChild(host);

  const ref = createComponent(component, { environmentInjector: injector, hostElement: host });
  appRef.attachView(ref.hostView);

  return {
    ref,
    host,
    destroy() {
      appRef.detachView(ref.hostView);
      ref.destroy();
      host.remove();
    },
  };
}
