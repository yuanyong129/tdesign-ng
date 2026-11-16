import {
  ApplicationRef,
  EnvironmentInjector,
  EnvironmentProviders,
  Injectable,
  InjectionToken,
  inject,
  makeEnvironmentProviders,
} from '@angular/core';
import { renderComponent } from '../../_utils/dynamic-component';
import { TNotification } from './notification.component';
import {
  NOTIFICATION_PLACEMENTS,
  NotificationInstance,
  NotificationOptions,
  NotificationPlacement,
  NotificationTheme,
} from './notification.types';

/** 全局默认配置，可通过 `provideTNotification()` 注入。 */
export const NOTIFICATION_CONFIG = new InjectionToken<NotificationOptions>('T_NOTIFICATION_CONFIG');

/** 与视口边缘的距离，与 TDesign 一致。 */
const DISTANCE = '16px';

const PLACEMENT_STYLE: Record<NotificationPlacement, Record<string, string>> = {
  'top-left': { left: DISTANCE, top: DISTANCE },
  'top-right': { right: DISTANCE, top: DISTANCE },
  'bottom-right': { right: DISTANCE, bottom: DISTANCE },
  'bottom-left': { left: DISTANCE, bottom: DISTANCE },
};

const DEFAULT_Z_INDEX = 6000;

const DEFAULT_DURATION = 3000;

interface NotificationEntry {
  placement: NotificationPlacement;
  destroy(): void;
}

/**
 * 全局通知服务，API 与 TDesign 的 NotifyPlugin 对齐。
 *
 * ```ts
 * private readonly notify = inject(TNotificationService);
 * this.notify.success({ title: '保存成功', content: '数据已同步到服务端' });
 * ```
 */
@Injectable({ providedIn: 'root' })
export class TNotificationService {
  private readonly appRef = inject(ApplicationRef);

  private readonly envInjector = inject(EnvironmentInjector);

  private readonly config = inject(NOTIFICATION_CONFIG, { optional: true }) ?? {};

  private readonly containers = new Map<NotificationPlacement, HTMLElement>();

  private readonly entries = new Set<NotificationEntry>();

  /** 普通通知。 */
  info(options: string | NotificationOptions): NotificationInstance {
    return this.show('info', options);
  }

  /** 成功通知。 */
  success(options: string | NotificationOptions): NotificationInstance {
    return this.show('success', options);
  }

  /** 警告通知。 */
  warning(options: string | NotificationOptions): NotificationInstance {
    return this.show('warning', options);
  }

  /** 错误通知。 */
  error(options: string | NotificationOptions): NotificationInstance {
    return this.show('error', options);
  }

  /** 按主题创建通知。 */
  show(theme: NotificationTheme, options: string | NotificationOptions): NotificationInstance {
    const normalized = this.normalize(theme, options);
    const container = this.getContainer(normalized);
    const rendered = renderComponent(TNotification, container, this.envInjector, this.appRef, 't-notification');
    const { ref, host } = rendered;

    ref.setInput('title', normalized.title ?? '');
    ref.setInput('content', normalized.content ?? '');
    ref.setInput('footer', normalized.footer);
    ref.setInput('theme', normalized.theme);
    ref.setInput('duration', normalized.duration);
    ref.setInput('icon', normalized.icon ?? true);
    ref.setInput('closeBtn', normalized.closeBtn ?? true);
    ref.changeDetectorRef.detectChanges();

    const element = host.querySelector('.t-notification');
    if (element && normalized.className) {
      element.classList.add(...normalized.className.split(/\s+/).filter(Boolean));
    }

    const entry: NotificationEntry = {
      placement: normalized.placement,
      destroy: () => {
        rendered.destroy();
        this.entries.delete(entry);
        this.releaseContainer(normalized.placement);
      },
    };
    this.entries.add(entry);

    let closed = false;
    const finish = () => {
      if (closed) return;
      closed = true;
      subscription.unsubscribe();
      entry.destroy();
    };
    const subscription = ref.instance.close.subscribe(finish);

    return { close: finish };
  }

  /** 关闭所有通知。 */
  closeAll(): void {
    for (const entry of [...this.entries]) entry.destroy();
    this.entries.clear();
    for (const container of this.containers.values()) container.remove();
    this.containers.clear();
  }

  private normalize(
    theme: NotificationTheme,
    options: string | NotificationOptions,
  ): NotificationOptions & { theme: NotificationTheme; duration: number; placement: NotificationPlacement } {
    const config = this.config;
    const input: NotificationOptions = typeof options === 'string' ? { content: options } : { ...options };
    return {
      ...input,
      theme: input.theme ?? theme,
      duration: input.duration ?? config.duration ?? DEFAULT_DURATION,
      placement: input.placement ?? config.placement ?? 'top-right',
    };
  }

  private getContainer(options: NotificationOptions): HTMLElement {
    const placement = options.placement ?? 'top-right';
    const existing = this.containers.get(placement);
    if (existing) return existing;

    const container = document.createElement('div');
    container.className = `t-notification__show--${placement}`;
    container.dataset['placement'] = placement;
    Object.assign(container.style, PLACEMENT_STYLE[placement]);
    container.style.zIndex = String(options.zIndex ?? this.config.zIndex ?? DEFAULT_Z_INDEX);
    if (placement.startsWith('bottom')) {
      container.style.display = 'flex';
      container.style.flexDirection = 'column-reverse';
    }
    document.body.appendChild(container);
    this.containers.set(placement, container);
    return container;
  }

  private releaseContainer(placement: NotificationPlacement): void {
    const container = this.containers.get(placement);
    if (!container) return;
    if (container.children.length > 0) return;
    container.remove();
    this.containers.delete(placement);
  }
}

/**
 * 注册通知服务，可传入全局默认配置。
 *
 * ```ts
 * bootstrapApplication(App, { providers: [provideTNotification({ placement: 'bottom-right' })] });
 * ```
 */
export function provideTNotification(config: NotificationOptions = {}): EnvironmentProviders {
  return makeEnvironmentProviders([
    TNotificationService,
    { provide: NOTIFICATION_CONFIG, useValue: config },
  ]);
}

/** 位置常量，供文档与调用方复用。 */
export const notificationPlacements = NOTIFICATION_PLACEMENTS;
