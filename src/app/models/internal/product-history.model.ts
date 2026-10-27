export interface ProductChange {
  campo: string;
  antes: string | number | null;
  despues: string | number | null;
}

export interface ProductHistoryEvent {
  id: string;
  accion: string;
  fecha: string;
  usuarioNombre: string;
  cambios: ProductChange[];
  ventaId?: string;
  motivo?: string;
}

export interface ProductHistory {
  producto: { id: string; nombre: string; unidadDeMedida: string; cantidadEnStock: number };
  eventos: ProductHistoryEvent[];
  total: number;
}
