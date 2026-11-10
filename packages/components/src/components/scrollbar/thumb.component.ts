import { Component, computed, signal, EventEmitter, Input, Output, ViewChild, ElementRef } from "@angular/core";
import { on, off } from '../../_utils/dom';
import { ThumbData, ThumbMap } from './interface';
import { getPrefixCls } from "../../_utils/global-config";
import { Direction } from "../../_utils/constant";

@Component({
  selector: 't-thumb',
  template: `
     <div
        #track
        [class]="cls()"
        (mousedown)="handleTrackClick($event)"
      >
        <div
          #thumb
          [class]="thumbCls()"
          [style]="thumbStyle()"
          (mousedown)="handleThumbMouseDown($event)"
        >
          <div class="{{prefixCls}}-thumb-bar" ></div>
        </div>
      </div>
  `,
  standalone: true,
  styles: []
})
export class TThumb {
  /**
   * @zh 滚动条滑块的位置与尺寸数据，由 `TScrollbar` 内部计算后传入
   * @en Thumb position and size data, computed internally by `TScrollbar`
   */
  @Input() data?: ThumbData;

  /**
   * @zh 滚动条的方向
   * @en Scroll direction
   * @values 'horizontal' | 'vertical'
   * @defaultValue 'horizontal'
   */
  @Input() direction: Direction = 'horizontal';

  /**
   * @zh 是否始终显示滚动条
   * @en Whether the scrollbar is always visible
   * @defaultValue false
   */
  @Input() alwaysShow: boolean = false;

  /**
   * @zh 是否同时显示横向与纵向滚动条
   * @en Whether to show both horizontal and vertical scrollbars
   * @defaultValue false
   */
  @Input() both: boolean = false;

  /**
   * @zh 滚动时触发，参数为滚动距离
   * @en Emits on scroll, with the scroll offset as the argument
   */
  @Output() scroll = new EventEmitter<number>();

  visible = signal(false);

  @ViewChild('track')
  trackRef?: ElementRef<HTMLDivElement>

  @ViewChild('thumb')
  thumbRef?: ElementRef<HTMLDivElement>

  offset = signal(0);

  isDragging = signal(false);
  mouseOffset = signal(0);

  thumbStyle = computed(() => {
      return {
        [this.thumbMap().size]: `${this.data?.thumbSize ?? 0}px`,
        [this.thumbMap().direction]: `${this.offset()}px`,
      };
    });

  prefixCls = getPrefixCls('scrollbar');

  thumbMap = computed<ThumbMap>(() => {
    if (this.direction === 'horizontal') {
      return {
        size: 'width',
        direction: 'left',
        offset: 'offsetWidth',
        client: 'clientX',
      };
    }
    return {
      size: 'height',
      direction: 'top',
      offset: 'offsetHeight',
      client: 'clientY',
    };
  });

  handleThumbMouseDown = (ev: MouseEvent) => {
    ev.preventDefault();

    if (this.thumbRef) {
      this.mouseOffset.set(ev[this.thumbMap().client] -
        this.thumbRef?.nativeElement.getBoundingClientRect()[this.thumbMap().direction]);
      this.isDragging.set(true);
      on(window, 'mousemove', this.handleMouseMove);
      on(window, 'mouseup', this.handleMouseUp);
      on(window, 'contextmenu', this.handleMouseUp);
    }
  };

  handleTrackClick = (ev: MouseEvent) => {
    ev.preventDefault();

    if (this.thumbRef) {
      const _offset = this.getLegalOffset(
        ev[this.thumbMap().client] >
          this.thumbRef?.nativeElement.getBoundingClientRect()[this.thumbMap().direction]
          ? this.offset() + (this.data?.thumbSize ?? 0)
          : this.offset() - (this.data?.thumbSize ?? 0)
      );
      if (_offset !== this.offset()) {
        this.offset.set(_offset);
        this.scroll.emit(_offset);
      }
    }
  };

  getLegalOffset = (offset: number) => {
    if (offset < 0) {
      return 0;
    }
    if (this.data && offset > this.data.max) {
      return this.data.max;
    }
    return offset;
  };

  handleMouseMove = (ev: MouseEvent) => {
    if (this.trackRef && this.thumbRef) {
      const _offset = this.getLegalOffset(
        ev[this.thumbMap().client] -
          this.trackRef?.nativeElement.getBoundingClientRect()[this.thumbMap().direction] -
          this.mouseOffset()
      );
      if (_offset !== this.offset()) {
        this.offset.set(_offset);
        this.scroll.emit(_offset);
      }
    }
  };

  handleMouseUp = () => {
    this.isDragging.set(false);
    off(window, 'mousemove', this.handleMouseMove);
    off(window, 'mouseup', this.handleMouseUp);
  };

  setOffset = (_offset: number) => {
    if (!this.isDragging()) {
      _offset = this.getLegalOffset(_offset);
      if (_offset !== this.offset()) {
        this.offset.set(_offset)
      }
    }
  };

  thumbCls = computed(() => [
    `${this.prefixCls}-thumb`,
    `${this.prefixCls}-thumb-direction-${this.direction}`,
    this.isDragging() ? `${this.prefixCls}-thumb-dragging` : '',
  ]);


  cls = computed(() => {
    return [
      `${this.prefixCls}-track`,
      `${this.prefixCls}-track-direction-${this.direction}`,
    ]
  })
}
