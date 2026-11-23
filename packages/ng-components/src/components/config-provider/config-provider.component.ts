import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ViewEncapsulation,
  effect,
  inject,
  input,
} from '@angular/core';
import { TConfigService } from './config-provider.service';
import type { TGlobalConfig } from './config-provider.types';

/**
 * 全局配置提供者。
 *
 * 上游在有 `t-config-provider` 时把配置注入整个子树；Angular 侧用一个 root 级
 * `TConfigService` 承接（组件按需读取），provider 销毁时恢复默认配置。宿主
 * 不产生任何 DOM 布局（bridge.less 里 `t-config-provider { display: contents }`）。
 *
 * `classPrefix`、`attach`、`animation` 等需要横切全部组件的键暂未生效，见 roadmap [D3]。
 */
@Component({
  selector: 't-config-provider',
  standalone: true,
  template: '<ng-content />',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class TConfigProvider {
  /** 全局配置。 @zh 全局配置 @en globalConfig */
  globalConfig = input<TGlobalConfig | undefined>(undefined);

  private readonly configService = inject(TConfigService);

  constructor() {
    effect(() => {
      this.configService.setConfig(this.globalConfig());
    });

    inject(DestroyRef).onDestroy(() => this.configService.setConfig(undefined));
  }
}
