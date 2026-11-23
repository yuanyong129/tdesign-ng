import { Component, signal } from '@angular/core';
import { TButton, TCalendar } from '@tdesign-ng/components';
import type {
  CalendarCell,
  CalendarCellEvent,
  CalendarControllerOptions,
  CalendarMode,
  CalendarMonthChangeEvent,
  CalendarValue,
} from '@tdesign-ng/components';

const MARKED_DAYS = new Set([5, 15, 25]);

const MONTH_LABELS = ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'];

@Component({
  selector: 'demo-calendar-custom',
  imports: [TButton, TCalendar],
  template: `
    <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-bottom: 12px">
      <t-button size="small" [variant]="mode() === 'month' ? 'base' : 'outline'" (click)="switchMode('month')">
        月视图
      </t-button>
      <t-button size="small" [variant]="mode() === 'year' ? 'base' : 'outline'" (click)="switchMode('year')">
        年视图
      </t-button>
      <span style="font: var(--td-font-body-medium); color: var(--td-text-color-secondary)">
        {{ displayed() }}，选中：{{ value() }}
      </span>
    </div>

    <ng-template #cellTpl let-cell>
      <div style="display: flex; flex-direction: column; align-items: center; gap: 2px">
        @if (cell.mode === 'year') {
          <span>{{ monthLabel(cell) }}</span>
        } @else {
          <span>{{ cell.date.getDate() }}</span>
          @if (isMarked(cell)) {
            <span
              style="width: 4px; height: 4px; border-radius: 50%; background: var(--td-brand-color)"
            ></span>
          }
        }
      </div>
    </ng-template>

    <t-calendar
      [mode]="mode()"
      [value]="value()"
      [cell]="cellTpl"
      (cellClick)="handleCellClick($event)"
      (monthChange)="handleMonthChange($event)"
      (controllerChange)="handleControllerChange($event)"
    />
  `,
})
export class DemoCalendarCustom {
  protected readonly mode = signal<CalendarMode>('month');

  protected readonly value = signal<CalendarValue | undefined>('2026-11-15');

  protected readonly displayed = signal('2026-11');

  protected switchMode(mode: CalendarMode): void {
    this.mode.set(mode);
  }

  protected monthLabel(cell: CalendarCell): string {
    return MONTH_LABELS[cell.date.getMonth()] ?? '';
  }

  protected isMarked(cell: CalendarCell): boolean {
    return cell.belongTo === 0 && MARKED_DAYS.has(cell.date.getDate());
  }

  protected handleCellClick(event: CalendarCellEvent): void {
    this.value.set(event.cell.formattedDate);
  }

  protected handleMonthChange(event: CalendarMonthChangeEvent): void {
    this.displayed.set(`${event.year}-${event.month.padStart(2, '0')}`);
  }

  protected handleControllerChange(event: CalendarControllerOptions): void {
    if (event.mode === 'month' || event.mode === 'year') {
      this.mode.set(event.mode);
    }
  }
}
