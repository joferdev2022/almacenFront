export type CashPaymentMethod = 'EFECTIVO' | 'YAPE' | 'PLIN' | 'TRANSFERENCIA' | 'TARJETA' | 'OTRO';
export interface CashMethodSummary {
  ingresos: number; egresos: number; neto: number; operaciones: number;
}
export interface CashSummary {
  ventasEfectivo: number; gastosEfectivo: number; otrosIngresos: number; retiros: number;
  ajustesEntrada: number; ajustesSalida: number; retiroCierre: number;
  ingresos: number; egresos: number; saldoEsperado: number; saldoTrasRetiro: number;
  metodos: Record<CashPaymentMethod, CashMethodSummary>; noEfectivo: CashMethodSummary;
}
export interface CashJournal {
  id: string; cajaId: string; cajaNombre: string; local: number; estado: 'ABIERTA' | 'CERRADA';
  fechaApertura: string; fechaCierre: string | null; montoApertura: number;
  usuarioAperturaNombre: string; usuarioCierreNombre: string | null;
  observacionApertura: string | null; observacionCierre: string | null;
  fondoEsperado: number | null; diferenciaApertura: number | null;
  montoContado: number | null; diferencia: number | null; fondoSiguiente: number | null;
  saldoEsperado: number | null; retiroCierre?: number; version: number; resumen: CashSummary;
}
export interface CashCurrent {
  caja: { id: string; nombre: string; inicioControl: string | null } | null;
  jornada: CashJournal | null; ultimoCierre: CashJournal | null; fondoSugerido: number;
}
export interface CashMovement {
  id: string; fecha: string; tipo: string; naturaleza: 'INGRESO' | 'EGRESO'; monto: number;
  metodoPago: CashPaymentMethod; afectaEfectivo: boolean;
  descripcion: string; usuarioNombre: string; origenTipo: string; origenId: string | null;
  observaciones?: string | null; origenAnulado?: boolean; correccionPosterior?: boolean;
}
export interface CashPage<T> { items: T[]; total: number; page: number; xpage: number; }
export interface CashResponse<T> { data: T; message: string; code: number; }
export interface CashOpeningRequest { operacionId: string; montoApertura: number; observaciones: string | null; }
export interface CashMovementRequest {
  operacionId: string; monto: number; motivo: string; metodoPago: CashPaymentMethod; observaciones: string | null;
}
export interface CashClosingRequest {
  operacionId: string; montoContado: number; fondoSiguiente: number; version: number; observaciones: string | null;
}
export interface OperationAudit {
  accion: string; fecha: string; usuarioNombre: string; motivo?: string | null;
  cambios?: { sinMovimiento?: boolean; nota?: string; anterior?: number; nuevo?: number;
    antes?: { monto?: number; precioTotalOriginal?: number }; despues?: { monto?: number; precioTotalOriginal?: number } }[];
}
