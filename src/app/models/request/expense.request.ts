import { ExpensePaymentMethod, ExpenseReceiptType, ExpenseState } from '../internal/expense.model';

export interface ExpenseRequest {
  fecha: string;
  categoria: string;
  descripcion: string | null;
  // Cadena decimal para no perder precisión antes de validar en el backend.
  monto: string;
  estado: ExpenseState;
  metodoPago: ExpensePaymentMethod | null;
  fechaPago: string | null;
  proveedorId: string | null;
  tipoComprobante: ExpenseReceiptType;
  numeroComprobante: string | null;
  observaciones: string | null;
}

export interface ExpensePaymentRequest {
  metodoPago: ExpensePaymentMethod;
  fechaPago: string;
}

export interface ExpenseFilters {
  search?: string;
  fecha_desde?: string;
  fecha_hasta?: string;
  categoria?: string;
  estado?: string;
  metodo_pago?: string;
}
