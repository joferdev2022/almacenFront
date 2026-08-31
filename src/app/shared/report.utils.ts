import { HttpErrorResponse } from '@angular/common/http';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { SalesReportFilters } from '../models/internal/report.model';
import { expenseToday } from './expense.utils';

export function canReadReports(): boolean {
  try { return Number(JSON.parse(localStorage.getItem('permissions') || 'null')) === 1; }
  catch { return false; }
}

export function defaultReportFilters(): SalesReportFilters {
  const today = expenseToday();
  return { fecha_desde: `${today.slice(0, 4)}-01-01`, fecha_hasta: today, producto: '', categoria: '', ventas: 'todas' };
}

export function reportRangeValidator(control: AbstractControl): ValidationErrors | null {
  const start: string = control.get('fecha_desde')?.value || '';
  const end: string = control.get('fecha_hasta')?.value || '';
  if (!start || !end) { return null; }
  if (start > end) { return { range: true }; }
  const months = (Number(end.slice(0, 4)) - Number(start.slice(0, 4))) * 12 + Number(end.slice(5, 7)) - Number(start.slice(5, 7)) + 1;
  return months > 60 || Number(start.slice(0, 4)) < 1900 ? { period: true } : null;
}

export function reportMonthLabel(month: string): string {
  const [year, number] = month.split('-');
  return `${['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'][Number(number) - 1]} ${year}`;
}

export function reportError(error: HttpErrorResponse): string {
  if (error.status === 0) { return 'No se pudo conectar con el servidor. Intenta nuevamente.'; }
  if (error.status === 401) { return 'Tu sesión no es válida. Vuelve a iniciar sesión para consultar reportes.'; }
  if (error.status === 403) { return 'No tienes permiso para consultar reportes y precios de compra de este local.'; }
  const detail = error.error?.detail;
  if (typeof detail === 'string') { return detail; }
  if (Array.isArray(detail)) { return 'Revisa las fechas y los filtros del reporte e intenta nuevamente.'; }
  return 'No se pudo generar el reporte. Intenta nuevamente.';
}

export async function reportDownloadError(error: HttpErrorResponse): Promise<string> {
  if (error.error instanceof Blob) {
    try { return reportError(new HttpErrorResponse({ status: error.status, error: JSON.parse(await error.error.text()) })); }
    catch { return reportError(error); }
  }
  return reportError(error);
}
