import { NativeDateAdapter } from '@angular/material/core';
import { MatDatepickerIntl } from '@angular/material/datepicker';

/** Interpreta fechas de calendario sin convertirlas a UTC ni aceptar días inexistentes. */
export class ExpenseDateAdapter extends NativeDateAdapter {
  override getFirstDayOfWeek(): number { return 1; }

  override parse(value: unknown): Date | null {
    if (value instanceof Date) { return this.clone(value); }
    if (typeof value !== 'string' || !value.trim()) { return null; }
    const text = value.trim();
    const local = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(text);
    const iso = /^(\d{4})-(\d{2})-(\d{2})$/.exec(text);
    if (!local && !iso) { return this.invalid(); }
    const year = Number(local ? local[3] : iso![1]);
    const month = Number(local ? local[2] : iso![2]);
    const day = Number(local ? local[1] : iso![3]);
    if (year < 1 || year > 9999 || month < 1 || month > 12 || day < 1) { return this.invalid(); }
    try { return this.createDate(year, month - 1, day); }
    catch { return this.invalid(); }
  }
}

export const EXPENSE_DATE_FORMATS = {
  parse: { dateInput: 'dd/MM/yyyy' },
  display: {
    dateInput: { day: '2-digit', month: '2-digit', year: 'numeric' },
    monthYearLabel: { month: 'long', year: 'numeric' },
    dateA11yLabel: { day: 'numeric', month: 'long', year: 'numeric' },
    monthYearA11yLabel: { month: 'long', year: 'numeric' }
  }
};

export function expenseDatepickerIntl(): MatDatepickerIntl {
  const labels = new MatDatepickerIntl();
  labels.calendarLabel = 'Calendario';
  labels.openCalendarLabel = 'Abrir calendario';
  labels.closeCalendarLabel = 'Cerrar calendario';
  labels.prevMonthLabel = 'Mes anterior';
  labels.nextMonthLabel = 'Mes siguiente';
  labels.prevYearLabel = 'Año anterior';
  labels.nextYearLabel = 'Año siguiente';
  labels.prevMultiYearLabel = 'Años anteriores';
  labels.nextMultiYearLabel = 'Años siguientes';
  labels.switchToMonthViewLabel = 'Elegir día';
  labels.switchToMultiYearViewLabel = 'Elegir mes y año';
  return labels;
}
