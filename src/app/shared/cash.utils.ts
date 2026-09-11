import { HttpErrorResponse } from '@angular/common/http';
import { AbstractControl, ValidationErrors } from '@angular/forms';

export function newOperationId(): string { return crypto.randomUUID(); }

export function operationError(error: HttpErrorResponse): string {
  if (error.status === 0) { return 'No se pudo conectar. Reintenta sin cerrar el formulario para evitar repetir la operación.'; }
  if (error.status === 401) { return 'No se pudo validar el acceso con el usuario actual.'; }
  const detail = error.error?.detail;
  if (typeof detail === 'string') { return detail; }
  if (Array.isArray(detail)) {
    return detail.map(item => String(item.msg || 'Revisa los datos ingresados.').replace(/^Value error, /, '')).join(' ');
  }
  return 'No se pudo completar la operación. Intenta nuevamente.';
}
export const CASH_CLOSED_ALERT =
  'No se puede registrar la operación porque no hay una Caja abierta. Abre la Caja e intenta nuevamente.';

export function isCashClosedError(error: HttpErrorResponse): boolean {
  const detail = error.error?.detail;
  return error.status === 409 && typeof detail === 'string' &&
    detail.toLocaleLowerCase('es').includes('no existe una caja abierta');
}

export function cashAmountValidator(control: AbstractControl): ValidationErrors | null {
  const value = String(control.value ?? '').trim().replace(',', '.');
  if (!value) { return null; }
  return /^\d+(\.\d{1,2})?$/.test(value) && Number(value) >= 0 && Number(value) <= 9999999999.99
    ? null : { amount: true };
}

export function amountValue(value: unknown): number {
  return Number(String(value ?? '').replace(',', '.'));
}
