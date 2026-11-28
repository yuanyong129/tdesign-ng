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
import { MESSAGE_THEMES, MessageCloseEvent, MessageContent, MessageTheme } from './message.types';

/**
 * 全局消息。
 *
 * 一般通过 `TMessageService` 调用，也可以直接写 `<t-message>` 做静态展示。
 */
@Component({
  selector: 't-message',
  standalone: true,
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './message.component.html',
})
export class TMessage {
  /** @zh 消息内容，支持字符串或模板 @en Message text or template @defaultValue '' */
  readonly content = input<MessageContent>('');

  /** @zh 消息主题 @en Message theme @defaultValue 'info' @values info, success, warning, error, question, loading */
  readonly theme = input<MessageTheme>('info');

  /** @zh 自动关闭的毫秒数，0 表示不自动关闭 @en Auto close duration in milliseconds, 0 means never @defaultValue 3000 */
  readonly duration = input(3000);

  /** @zh 图标，布尔值控制默认图标，也支持字符串或模板 @en Default icon toggle, text or template @defaultValue true */
  readonly icon = input<boolean | MessageContent>(true);

  /** @zh 关闭入口，布尔值控制默认按钮，也支持字符串或模板 @en Default close toggle, text or template @defaultValue false */
  readonly closeBtn = input<boolean | MessageContent>(false);

  /** @zh 消息关闭 @en Emitted when the message closes */
  readonly close = output<MessageCloseEvent>();

  /** @zh 点击关闭按钮 @en Emitted when the close button is clicked */
  readonly closeBtnClick = output<MouseEvent | KeyboardEvent>();

  /** @zh 自动关闭倒计时结束 @en Emitted when auto close expires */
  readonly durationEnd = output<void>();

  protected readonly isTemplateContent = isTemplateContent;
  protected readonly customIcon = computed(() => typeof this.icon() === 'boolean' ? undefined : this.icon() as MessageContent);
  protected readonly customClose = computed(() => typeof this.closeBtn() === 'boolean' ? undefined : this.closeBtn() as MessageContent);
  protected readonly lifecycle = createFeedbackLifecycle(() => this.duration(), (expired, alive) => {
    if (expired) { this.durationEnd.emit(); if (alive()) this.close.emit({ trigger: 'duration-end' }); }
    else { this.closeBtnClick.emit(this.closeEvent!); if (alive()) this.close.emit({ trigger: 'close-click', event: this.closeEvent }); }
  });
  private closeEvent?: MouseEvent | KeyboardEvent;

  protected readonly themes = MESSAGE_THEMES;

  protected readonly classes = computed(() =>
    ['t-message', `t-is-${this.theme()}`, this.closeBtn() ? 't-is-closable' : ''].filter(Boolean).join(' '),
  );

  protected readonly isQuestion = computed(() => this.theme() === 'question');

  protected readonly isLoading = computed(() => this.theme() === 'loading');

  protected handleCloseBtn(event: MouseEvent | KeyboardEvent): void {
    if (event instanceof KeyboardEvent && (event.key !== 'Enter' && event.key !== ' ' || event.repeat)) return;
    event.preventDefault();
    event.stopPropagation();
    this.closeEvent = event;
    this.lifecycle.close();
  }
}
