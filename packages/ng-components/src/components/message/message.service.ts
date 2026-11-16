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
import { TMessage } from './message.component';
import {
  MESSAGE_PLACEMENTS,
  MessageInstance,
  MessageOptions,
  MessagePlacement,
  MessageTheme,
} from './message.types';

/** 全局默认配置，可通过 `provideTMessage()` 注入。 */
export const MESSAGE_CONFIG = new InjectionToken<MessageOptions>('T_MESSAGE_CONFIG');

/** 默认距离视口边缘的距离，与 TDesign 一致。 */
const DISTANCE = '32px';

/** 各位置对应的容器定位，与 TDesign 的 PLACEMENT_OFFSET 保持一致。 */
const PLACEMENT_STYLE: Record<MessagePlacement, Record<string, string>> = {
  center: { left: '50%', top: '50%', transform: 'translateX(-50%) translateY(-50%)' },
  left: { left: DISTANCE, top: '50%', transform: 'translateY(-50%)' },
  right: { right: DISTANCE, top: '50%', transform: 'translateY(-50%)' },
  top: { top: DISTANCE, left: '50%', transform: 'translateX(-50%)' },
  bottom: { bottom: DISTANCE, left: '50%', transform: 'translateX(-50%)' },
  'top-left': { left: DISTANCE, top: DISTANCE },
  'top-right': { right: DISTANCE, top: DISTANCE },
  'bottom-left': { left: DISTANCE, bottom: DISTANCE },
  'bottom-right': { right: DISTANCE, bottom: DISTANCE },
};

const DEFAULT_Z_INDEX = 6000;

const DEFAULT_DURATION = 3000;

interface MessageEntry {
  placement: MessagePlacement;
  destroy(): void;
}

/**
 * 全局消息服务，API 与 TDesign 的 MessagePlugin 对齐。
 *
 * ```ts
 * private readonly message = inject(TMessageService);
 * this.message.success('保存成功');
 * this.message.warning({ content: '库存不足', duration: 0 });
 * ```
 */
@Injectable({ providedIn: 'root' })
export class TMessageService {
  private readonly appRef = inject(ApplicationRef);

  private readonly envInjector = inject(EnvironmentInjector);

  private readonly config = inject(MESSAGE_CONFIG, { optional: true }) ?? {};

  private readonly containers = new Map<MessagePlacement, HTMLElement>();

  private readonly entries = new Set<MessageEntry>();

  /** 普通消息。 */
  info(message: string | MessageOptions, duration?: number): MessageInstance {
    return this.show('info', message, duration);
  }

  /** 成功消息。 */
  success(message: string | MessageOptions, duration?: number): MessageInstance {
    return this.show('success', message, duration);
  }

  /** 警告消息。 */
  warning(message: string | MessageOptions, duration?: number): MessageInstance {
    return this.show('warning', message, duration);
  }

  /** 错误消息。 */
  error(message: string | MessageOptions, duration?: number): MessageInstance {
    return this.show('error', message, duration);
  }

  /** 疑问消息。 */
  question(message: string | MessageOptions, duration?: number): MessageInstance {
    return this.show('question', message, duration);
  }

  /** 加载中消息，默认不自动关闭。 */
  loading(message: string | MessageOptions, duration = 0): MessageInstance {
    return this.show('loading', message, duration);
  }

  /** 按主题创建消息。 */
  show(theme: MessageTheme, message: string | MessageOptions, duration?: number): MessageInstance {
    const options = this.normalize(theme, message, duration);
    const container = this.getContainer(options);
    const rendered = renderComponent(TMessage, container, this.envInjector, this.appRef, 't-message');
    const { ref, host } = rendered;

    ref.setInput('content', options.content ?? '');
    ref.setInput('theme', options.theme);
    ref.setInput('duration', options.duration);
    ref.setInput('icon', options.icon ?? true);
    ref.setInput('closeBtn', options.closeBtn ?? false);
    ref.changeDetectorRef.detectChanges();

    const messageElement = host.querySelector<HTMLElement>('.t-message');
    if (messageElement && options.className) {
      messageElement.classList.add(...options.className.split(/\s+/).filter(Boolean));
    }
    if (messageElement && options.offset) {
      const [x, y] = options.offset;
      messageElement.style.position = 'relative';
      if (x !== undefined && x !== '') messageElement.style.left = this.toLength(x);
      if (y !== undefined && y !== '') messageElement.style.top = this.toLength(y);
    }

    const entry: MessageEntry = {
      placement: options.placement,
      destroy: () => {
        rendered.destroy();
        this.entries.delete(entry);
        this.releaseContainer(options.placement);
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

  /** 关闭所有消息。 */
  closeAll(): void {
    for (const entry of [...this.entries]) entry.destroy();
    this.entries.clear();
    for (const container of this.containers.values()) container.remove();
    this.containers.clear();
  }

  private normalize(
    theme: MessageTheme,
    message: string | MessageOptions,
    duration?: number,
  ): MessageOptions & { theme: MessageTheme; duration: number; placement: MessagePlacement } {
    const config = this.config;
    const options: MessageOptions = typeof message === 'string' ? { content: message } : { ...message };
    return {
      ...options,
      theme: options.theme ?? theme,
      duration: duration ?? options.duration ?? config.duration ?? DEFAULT_DURATION,
      placement: options.placement ?? config.placement ?? 'top',
    };
  }

  private getContainer(options: MessageOptions): HTMLElement {
    const placement = options.placement ?? 'top';
    const existing = this.containers.get(placement);
    if (existing) return existing;

    const container = document.createElement('div');
    container.className = 't-message__list';
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

  private releaseContainer(placement: MessagePlacement): void {
    const container = this.containers.get(placement);
    if (!container) return;
    if (container.children.length > 0) return;
    container.remove();
    this.containers.delete(placement);
  }

  private toLength(value: string | number): string {
    return typeof value === 'number' ? `${value}px` : value;
  }
}

/**
 * 注册消息服务，可传入全局默认配置。
 *
 * ```ts
 * bootstrapApplication(App, { providers: [provideTMessage({ duration: 5000 })] });
 * ```
 */
export function provideTMessage(config: MessageOptions = {}): EnvironmentProviders {
  return makeEnvironmentProviders([
    TMessageService,
    { provide: MESSAGE_CONFIG, useValue: config },
  ]);
}

/** 位置常量，供文档与调用方复用。 */
export const messagePlacements = MESSAGE_PLACEMENTS;
