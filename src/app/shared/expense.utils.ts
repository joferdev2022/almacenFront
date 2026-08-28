import { HttpErrorResponse } from '@angular/common/http';
import { AbstractControl, ValidationErrors } from '@angular/forms';

export function expenseToday(): string {
  const parts = new Intl.DateTimeFormat('en', {
    timeZone: 'America/Lima', year: 'numeric', month: '2-digit', day: '2-digit'
  }).formatToParts(new Date());
  const part = (type: string) => parts.find(item => item.type === type)!.value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}

export function expenseDateInput(value: string | null | undefined): string {
  return value ? value.slice(0, 10) : '';
}

export function expenseAmountValidator(control: AbstractControl): ValidationErrors | null {
  const value = String(control.value ?? '').trim().replace(',', '.');
  if (!value) { return null; }
  return /^\d+(\.\d{1,2})?$/.test(value) && Number(value) > 0 && Number(value) <= 9999999999.99
    ? null : { amount: true };
}

export function expenseDateValidator(control: AbstractControl): ValidationErrors | null {
  const value = String(control.value ?? '');
  if (!value) { return null; }
  const parsed = new Date(value + 'T12:00:00Z');
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === value ? null : { date: true };
}

export function expenseError(error: HttpErrorResponse): string {
  if (error.status === 0) { return 'No se pudo conectar con el servidor. Intenta nuevamente.'; }
  if (error.status === 401) { return 'No se pudo validar el acceso a Gastos.'; }
  const detail = error.error?.detail;
  if (typeof detail === 'string') { return detail; }
  if (Array.isArray(detail)) {
    const labels: Record<string, string> = {
      monto: 'Monto', fecha: 'Fecha', fechaPago: 'Fecha de pago', metodoPago: 'Método de pago',
      categoria: 'Categoría', estado: 'Estado', proveedorId: 'Proveedor'
    };
    return detail.map((item: { loc?: string[]; msg?: string; type?: string }) => {
      const field = item.loc?.[item.loc.length - 1] || '';
      const message = item.type?.startsWith('decimal') || item.type === 'greater_than'
        ? 'Debe ser mayor a cero y tener como máximo dos decimales.'
        : item.msg?.replace(/^Value error, /, '') || 'Valor inválido.';
      return (labels[field] ? labels[field] + ': ' : '') + message;
    }).join(' ');
  }
  return 'No se pudo completar la operación. Intenta nuevamente.';
}
