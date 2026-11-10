export interface ProductDosageEntry {
  cultivo: string;
  objetivo: string;
  dosis: string;
  baseAplicacion: string;
  aplicacion: string;
  observaciones: string;
  fuente: string;
}

export interface ProductDosage {
  producto: { id: string; nombre: string; unidadDeMedida: string };
  dosificaciones: ProductDosageEntry[];
  version: number;
  puedeEditar: boolean;
  actualizadoEn: string | null;
  actualizadoPor: { id: string; nombre: string } | null;
}

export interface ProductDosageUpdate {
  version: number;
  dosificaciones: ProductDosageEntry[];
}
