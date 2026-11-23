import { Injectable, signal } from '@angular/core';
import type { TGlobalConfig } from './config-provider.types';

/**
 * 全局配置的读取端。
 *
 * 组件通过本服务读取 `t-config-provider` 注入的配置；没有 provider 时读到空对象，
 * 组件回退到内置文案，行为与不接配置时完全一致。
 */
@Injectable({ providedIn: 'root' })
export class TConfigService {
  private readonly state = signal<TGlobalConfig>({});

  /** 当前生效的全局配置。 */
  readonly config = this.state.asReadonly();

  /** 由 `t-config-provider` 写入；传 `undefined` 表示恢复默认。 */
  setConfig(config: TGlobalConfig | undefined): void {
    this.state.set(config ?? {});
  }
}
