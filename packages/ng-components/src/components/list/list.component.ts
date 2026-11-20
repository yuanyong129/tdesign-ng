import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  booleanAttribute,
  computed,
  input,
  output,
} from '@angular/core';
import { TLoading } from '../loading';
import { LIST_LAYOUTS, LIST_SIZES, ListLayout, ListLoadMoreEvent, ListScrollEvent, ListSize } from './list.types';

const SIZE_CLASS: Record<ListSize, string> = {
  small: 't-size-s',
  medium: 't-size-m',
  large: 't-size-l',
};

/**
 * @zh 列表
 * @en List
 */
@Component({
  selector: 't-list',
  standalone: true,
  imports: [TLoading],
  templateUrl: './list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class TList {
  /** @zh 列表头部内容 @en List header */
  readonly header = input<string | undefined>(undefined);

  /** @zh 列表底部内容 @en List footer */
  readonly footer = input<string | undefined>(undefined);

  /** @zh 操作区排列方式，vertical 时操作区另起一行 @en Action layout @defaultValue 'horizontal' @values horizontal, vertical */
  readonly layout = input<ListLayout>('horizontal');

  /** @zh 列表尺寸 @en List size @defaultValue 'medium' @values small, medium, large */
  readonly size = input<ListSize>('medium');

  /** @zh 是否显示分割线 @en Show split line @defaultValue false */
  readonly split = input(false, { transform: booleanAttribute });

  /** @zh 是否显示斑马纹 @en Show stripe background @defaultValue false */
  readonly stripe = input(false, { transform: booleanAttribute });

  /** @zh 异步加载状态，loading 显示加载图标，load-more 显示「加载更多」 @en Async loading state @values loading, load-more */
  readonly asyncLoading = input<string | undefined>(undefined);

  /** @zh 点击加载更多时触发 @en Emitted when the load-more area is clicked */
  readonly loadMore = output<ListLoadMoreEvent>();

  /** @zh 列表滚动时触发 @en Emitted when the list scrolls */
  readonly scrollChange = output<ListScrollEvent>();

  protected readonly layouts = LIST_LAYOUTS;
  protected readonly sizes = LIST_SIZES;

  /** @zh 是否处于「加载更多」状态 @en Whether the list is in load-more state */
  protected readonly isLoadMore = computed(() => this.asyncLoading() === 'load-more');

  /** @zh 是否处于「加载中」状态 @en Whether the list is loading */
  protected readonly isLoading = computed(() => this.asyncLoading() === 'loading');

  /** @zh 列表根节点类名 @en List root classes */
  protected readonly classes = computed(() =>
    [
      't-list',
      SIZE_CLASS[this.size()],
      this.split() ? 't-list--split' : '',
      this.stripe() ? 't-list--stripe' : '',
      this.layout() === 'vertical' ? 't-list--vertical-action' : '',
    ]
      .filter(Boolean)
      .join(' '),
  );

  /** @zh 加载区类名 @en Loading area classes */
  protected readonly loadingClasses = computed(() => {
    const state = this.asyncLoading();
    return state === 'loading' || state === 'load-more' ? `t-list__load t-list__load--${state}` : 't-list__load';
  });

  /** @zh 加载区是否显示自定义文案 @en Whether the loading area shows custom text */
  protected readonly hasCustomLoadingText = computed(() => {
    const state = this.asyncLoading();
    return !!state && state !== 'loading' && state !== 'load-more';
  });

  protected handleLoadMore(event: MouseEvent): void {
    const state = this.asyncLoading();
    if (typeof state === 'string' && state !== 'load-more') {
      return;
    }
    this.loadMore.emit({ originalEvent: event });
  }

  protected handleScroll(event: Event): void {
    const element = event.target as HTMLElement;
    this.scrollChange.emit({
      originalEvent: event,
      scrollTop: element.scrollTop,
      scrollBottom: element.scrollHeight - element.clientHeight - element.scrollTop,
    });
  }
}
