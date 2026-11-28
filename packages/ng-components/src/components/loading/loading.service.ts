import { DOCUMENT } from '@angular/common';
import { ApplicationRef, DestroyRef, EnvironmentInjector, Injectable, inject } from '@angular/core';
import { renderComponent } from '../../_utils/dynamic-component';
import { TLoading } from './loading.component';
import { LOADING_SIZES, LoadingInstance, LoadingServiceOptions } from './loading.types';

/**
 * 全屏加载服务，API 与 TDesign 的 LoadingPlugin 对齐。
 *
 * ```ts
 * private readonly loading = inject(TLoadingService);
 * const instance = this.loading.show({ text: '保存中' });
 * instance.hide();
 * ```
 */
@Injectable({ providedIn: 'root' })
export class TLoadingService {
  private readonly document = inject(DOCUMENT);
  private readonly instances = new Set<LoadingInstance>();
  private destroyed = false;
  constructor() { inject(DestroyRef).onDestroy(() => { this.destroyed = true; this.hideAll(); }); }
  private readonly appRef = inject(ApplicationRef);

  private readonly envInjector = inject(EnvironmentInjector);

  /**
   * 显示全屏加载。
   *
   * 传入 `false` 会立即返回一个空实例，方便按条件调用。
   */
  show(options: boolean | LoadingServiceOptions = {}): LoadingInstance {
    if (options === false || this.destroyed || !this.document.body) return { hide: () => {} };
    const config: LoadingServiceOptions = options === true ? {} : options;

    const rendered = renderComponent(TLoading, this.document.body, this.envInjector, this.appRef, 't-loading');
    const { ref } = rendered;

    ref.setInput('loading', true);
    ref.setInput('fullscreen', config.fullscreen ?? true);
    ref.setInput('text', config.text);
    ref.setInput('size', config.size ?? 'medium');
    ref.setInput('inheritColor', config.inheritColor ?? false);
    ref.setInput('showOverlay', config.showOverlay ?? true);
    ref.setInput('preventScrollThrough', config.preventScrollThrough ?? true);
    ref.setInput('delay', config.delay ?? 0);
    ref.setInput('zIndex', config.zIndex);
    ref.setInput('attach', config.attach);
    ref.setInput('content', config.content);
    ref.setInput('indicator', config.indicator ?? true);
    ref.changeDetectorRef.detectChanges();

    let hidden = false;
    const instance: LoadingInstance = {
      hide: () => {
        if (hidden) return;
        hidden = true;
        this.instances.delete(instance);
        rendered.destroy();
      },
    };
    this.instances.add(instance);
    return instance;
  }

  /** 关闭所有由本服务创建的加载（用于兜底）。 */
  hideAll(): void {
    for (const instance of [...this.instances]) instance.hide();
  }
}

/** 尺寸常量，供文档与调用方复用。 */
export const loadingSizes = LOADING_SIZES;
