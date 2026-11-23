import { Component, signal } from '@angular/core';
import { TButton, TCalendar } from '@tdesign-ng/components';
import type { CalendarCellEvent, CalendarMonthChangeEvent, CalendarValue } from '@tdesign-ng/components';

@Component({
  selector: 'demo-calendar-controlled',
  imports: [TButton, TCalendar],
  template: `
    <div style="display: flex; flex-wrap: wrap; align-items: center; gap: 8px; margin-bottom: 12px">
      <t-button size="small" (click)="select('2026-11-23')">选中 11-23</t-button>
      <t-button size="small" variant="outline" (click)="select('2026-12-01')">选中 12-01</t-button>
      <span style="font: var(--td-font-body-medium); color: var(--td-text-color-secondary)">
        value：{{ value() }}｜展示年月：{{ displayed() }}
      </span>
    </div>
    <t-calendar
      theme="card"
      [value]="value()"
      (cellClick)="handleCellClick($event)"
      (monthChange)="handleMonthChange($event)"
    />
  `,
})
export class DemoCalendarControlled {
  protected readonly value = signal<CalendarValue | undefined>('2026-11-23');

  protected readonly displayed = signal('2026-11');

  protected select(value: CalendarValue): void {
    this.value.set(value);
  }

  protected handleCellClick(event: CalendarCellEvent): void {
    this.value.set(event.cell.formattedDate);
  }

  protected handleMonthChange(event: CalendarMonthChangeEvent): void {
    this.displayed.set(`${event.year}-${event.month.padStart(2, '0')}`);
  }
}
