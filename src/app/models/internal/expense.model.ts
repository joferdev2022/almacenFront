export type ExpenseState = 'PAGADO' | 'PENDIENTE';
export type ExpensePaymentMethod = 'EFECTIVO' | 'YAPE' | 'PLIN' | 'TRANSFERENCIA' | 'TARJETA' | 'OTRO';
export type ExpenseReceiptType = 'BOLETA' | 'FACTURA' | 'RECIBO' | 'SIN_COMPROBANTE' | 'OTRO';

export interface ExpenseModel {
  id: string;
  fecha: string;
  categoria: string;
  descripcion: string | null;
  monto: number;
  estado: ExpenseState;
  metodoPago: ExpensePaymentMethod | null;
  fechaPago: string | null;
  proveedorId: string | null;
  proveedorNombre: string | null;
  tipoComprobante: ExpenseReceiptType;
  numeroComprobante: string | null;
  observaciones: string | null;
  usuarioId: string;
  local: number;
  created_at: string;
  updated_at: string;
  updated_by: string;
}

export interface ExpenseOptions {
  categorias: string[];
  estados: ExpenseState[];
  metodosPago: ExpensePaymentMethod[];
  tiposComprobante: ExpenseReceiptType[];
}

export interface ExpenseSummary {
  registrados: number;
  pagados: number;
  pendientes: number;
  pagadosEfectivo: number;
}

export interface ExpenseProvider {
  id: string;
  nombreProvider: string;
}

export interface ExpenseProviderPage {
  items: ExpenseProvider[];
  total: number;
  page: number;
  xpage: number;
}
