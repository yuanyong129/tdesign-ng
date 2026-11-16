import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  effect,
  input,
  output,
} from '@angular/core';
import { NOTIFICATION_THEMES, NotificationCloseEvent, NotificationTheme } from './notification.types';

/**
 * 全局通知。
 *
 * 一般通过 `TNotificationService` 调用，也可以直接写 `<t-notification>` 做静态展示。
 */
@Component({
  selector: 't-notification',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './notification.component.html',
})
export class TNotification {
  /** @zh 标题 @en Title @defaultValue '' */
  readonly title = input('');

  /** @zh 内容 @en Content @defaultValue '' */
  readonly content = input('');

  /** @zh 底部补充内容 @en Footer content @defaultValue undefined */
  readonly footer = input<string | undefined>();

  /** @zh 通知主题 @en Notification theme @defaultValue 'info' @values info, success, warning, error */
  readonly theme = input<NotificationTheme>('info');

  /** @zh 自动关闭的毫秒数，0 表示不自动关闭 @en Auto close duration in milliseconds, 0 means never @defaultValue 3000 */
  readonly duration = input(3000);

  /** @zh 是否显示图标 @en Whether to show the icon @defaultValue true */
  readonly icon = input(true, { transform: booleanAttribute });

  /** @zh 是否显示关闭按钮 @en Whether to show the close button @defaultValue true */
  readonly closeBtn = input(true, { transform: booleanAttribute });

  /** @zh 通知关闭 @en Emitted when the notification closes */
  readonly close = output<NotificationCloseEvent>();

  /** @zh 点击关闭按钮 @en Emitted when the close button is clicked */
  readonly closeBtnClick = output<MouseEvent>();

  protected readonly themes = NOTIFICATION_THEMES;

  protected readonly classes = computed(() => `t-notification t-is-${this.theme()}`);

  protected readonly iconClasses = computed(() => `t-icon t-is-${this.theme()}`);

  constructor() {
    effect((onCleanup) => {
      const duration = this.duration();
      if (duration <= 0) return;
      const timer = setTimeout(() => this.close.emit({ trigger: 'duration-end' }), duration);
      onCleanup(() => clearTimeout(timer));
    });
  }

  protected handleCloseBtn(event: MouseEvent): void {
    event.stopPropagation();
    this.closeBtnClick.emit(event);
    this.close.emit({ trigger: 'close-click', event });
  }
}
