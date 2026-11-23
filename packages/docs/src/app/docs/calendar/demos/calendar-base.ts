import { Component, signal } from '@angular/core';
import { TCalendar } from '@tdesign-ng/components';
import type { CalendarCellEvent, CalendarValue } from '@tdesign-ng/components';

@Component({
  selector: 'demo-calendar-base',
  imports: [TCalendar],
  template: `
    <t-calendar [value]="value()" (cellClick)="handleCellClick($event)" />
    <div style="margin-top: 12px; font: var(--td-font-body-medium); color: var(--td-text-color-secondary)">
      当前选中：{{ value() ?? '未选择' }}
    </div>
  `,
})
export class DemoCalendarBase {
  protected readonly value = signal<CalendarValue | undefined>('2026-11-10');

  protected handleCellClick(event: CalendarCellEvent): void {
    this.value.set(event.cell.formattedDate);
  }
}
