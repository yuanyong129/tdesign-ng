import { NgTemplateOutlet } from '@angular/common';
import { createFeedbackLifecycle } from '../../_utils/feedback-lifecycle';
import { isTemplateContent } from '../../_utils/content';
import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  input,
  output,
} from '@angular/core';
import { NOTIFICATION_THEMES, NotificationCloseEvent, NotificationContent, NotificationTheme } from './notification.types';

/**
 * 全局通知。
 *
 * 一般通过 `TNotificationService` 调用，也可以直接写 `<t-notification>` 做静态展示。
 */
@Component({
  selector: 't-notification',
  standalone: true,
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './notification.component.html',
})
export class TNotification {
  /** @zh 标题，支持字符串或模板 @en Title text or template @defaultValue '' */
  readonly title = input<NotificationContent>('');

  /** @zh 内容，支持字符串或模板；未设置时显示投影 @en Content text or template, falls back to projection when omitted @defaultValue undefined */
  readonly content = input<NotificationContent>(undefined);

  /** @zh 底部补充内容，支持字符串或模板 @en Footer text or template @defaultValue undefined */
  readonly footer = input<NotificationContent>();

  /** @zh 通知主题 @en Notification theme @defaultValue 'info' @values info, success, warning, error */
  readonly theme = input<NotificationTheme>('info');

  /** @zh 自动关闭的毫秒数，0 表示不自动关闭 @en Auto close duration in milliseconds, 0 means never @defaultValue 3000 */
  readonly duration = input(3000);

  /** @zh 图标，布尔值控制默认图标，也支持字符串或模板 @en Default icon toggle, text or template @defaultValue true */
  readonly icon = input<boolean | NotificationContent>(true);

  /** @zh 关闭入口，布尔值控制默认按钮，也支持字符串或模板 @en Default close toggle, text or template @defaultValue true */
  readonly closeBtn = input<boolean | NotificationContent>(true);

  /** @zh 通知关闭 @en Emitted when the notification closes */
  readonly close = output<NotificationCloseEvent>();

  /** @zh 点击关闭按钮 @en Emitted when the close button is clicked */
  readonly closeBtnClick = output<MouseEvent | KeyboardEvent>();

  /** @zh 自动关闭倒计时结束 @en Emitted when auto close expires */
  readonly durationEnd = output<void>();

  protected readonly isTemplateContent = isTemplateContent;
  protected readonly customIcon = computed(() => typeof this.icon() === 'boolean' ? undefined : this.icon() as NotificationContent);
  protected readonly customClose = computed(() => typeof this.closeBtn() === 'boolean' ? undefined : this.closeBtn() as NotificationContent);
  protected readonly lifecycle = createFeedbackLifecycle(() => this.duration(), (expired, alive) => {
    if (expired) { this.durationEnd.emit(); if (alive()) this.close.emit({ trigger: 'duration-end' }); }
    else { this.closeBtnClick.emit(this.closeEvent!); if (alive()) this.close.emit({ trigger: 'close-click', event: this.closeEvent }); }
  });
  private closeEvent?: MouseEvent | KeyboardEvent;

  protected readonly themes = NOTIFICATION_THEMES;

  protected readonly classes = computed(() => `t-notification t-is-${this.theme()}`);

  protected readonly iconClasses = computed(() => `t-icon t-is-${this.theme()}`);

  protected handleCloseBtn(event: MouseEvent | KeyboardEvent): void {
    if (event instanceof KeyboardEvent && (event.key !== 'Enter' && event.key !== ' ' || event.repeat)) return;
    event.preventDefault();
    event.stopPropagation();
    this.closeEvent = event;
    this.lifecycle.close();
  }
}
