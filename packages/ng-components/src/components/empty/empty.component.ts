import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  computed,
  contentChild,
  input,
} from '@angular/core';
import { TEmptyAction } from './empty-action.directive';
import {
  EMPTY_DEFAULT_TITLES,
  EMPTY_SIZES,
  EMPTY_TYPES,
  EmptySize,
  EmptyType,
} from './empty.types';

const SIZE_CLASS: Record<EmptySize, string> = {
  small: 't-size-s',
  medium: 't-size-m',
  large: 't-size-l',
};

/**
 * 空状态。
 *
 * ```html
 * <t-empty description="描述文字" />
 * <t-empty type="success" description="提交成功" />
 * <t-empty type="network-error">
 *   <t-button tEmptyAction>重新加载</t-button>
 * </t-empty>
 * ```
 */
@Component({
  selector: 't-empty',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  templateUrl: './empty.component.html',
})
export class TEmpty {
  /** @zh 空状态类型 @en Empty type @defaultValue 'empty' @values empty, success, fail, network-error, maintenance */
  readonly type = input<EmptyType>('empty');

  /** @zh 尺寸 @en Empty size @defaultValue 'medium' @values small, medium, large */
  readonly size = input<EmptySize>('medium');

  /** @zh 标题，不传时按 type 使用内置文案 @en Title, falls back to the built-in text of the type @defaultValue undefined */
  readonly title = input<string | undefined>();

  /** @zh 描述文字 @en Description @defaultValue undefined */
  readonly description = input<string | undefined>();

  /** @zh 自定义图片地址，替换内置插图 @en Custom image URL, replaces the built-in illustration @defaultValue undefined */
  readonly image = input<string | undefined>();

  /** @zh 图片样式 @en Image style @defaultValue undefined */
  readonly imageStyle = input<Record<string, string> | undefined>();

  protected readonly types = EMPTY_TYPES;
  protected readonly sizes = EMPTY_SIZES;

  /** 是否投影了操作区内容。 */
  protected readonly action = contentChild(TEmptyAction);

  protected readonly classes = computed(() =>
    ['t-empty', SIZE_CLASS[this.size()]].filter(Boolean).join(' '),
  );

  protected readonly titleText = computed(
    () => this.title() ?? EMPTY_DEFAULT_TITLES[this.type()],
  );

  protected readonly hasAction = computed(() => !!this.action());
}
