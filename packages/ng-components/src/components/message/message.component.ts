import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  effect,
  inject,
  input,
  output,
} from '@angular/core';
import { MESSAGE_THEMES, MessageCloseEvent, MessageTheme } from './message.types';

/**
 * 全局消息。
 *
 * 一般通过 `TMessageService` 调用，也可以直接写 `<t-message>` 做静态展示。
 */
@Component({
  selector: 't-message',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './message.component.html',
})
export class TMessage {
  private readonly destroyRef = inject(DestroyRef);

  /** @zh 消息文字 @en Message content @defaultValue '' */
  readonly content = input('');

  /** @zh 消息主题 @en Message theme @defaultValue 'info' @values info, success, warning, error, question, loading */
  readonly theme = input<MessageTheme>('info');

  /** @zh 自动关闭的毫秒数，0 表示不自动关闭 @en Auto close duration in milliseconds, 0 means never @defaultValue 3000 */
  readonly duration = input(3000);

  /** @zh 是否显示图标 @en Whether to show the icon @defaultValue true */
  readonly icon = input(true, { transform: booleanAttribute });

  /** @zh 是否显示关闭按钮 @en Whether to show the close button @defaultValue false */
  readonly closeBtn = input(false, { transform: booleanAttribute });

  /** @zh 消息关闭 @en Emitted when the message closes */
  readonly close = output<MessageCloseEvent>();

  /** @zh 点击关闭按钮 @en Emitted when the close button is clicked */
  readonly closeBtnClick = output<MouseEvent>();

  protected readonly themes = MESSAGE_THEMES;

  protected readonly classes = computed(() =>
    ['t-message', `t-is-${this.theme()}`, this.closeBtn() ? 't-is-closable' : ''].filter(Boolean).join(' '),
  );

  protected readonly isQuestion = computed(() => this.theme() === 'question');

  protected readonly isLoading = computed(() => this.theme() === 'loading');

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
