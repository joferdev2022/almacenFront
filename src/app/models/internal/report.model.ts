export interface SalesReportFilters {
  fecha_desde: string;
  fecha_hasta: string;
  producto: string;
  categoria: string;
  ventas: 'todas' | 'pagadas';
}

export interface ReportProduct {
  productoId: string;
  producto: string;
  categoriaActual: string | null;
  precioCompraActual: number | null;
  presentacion: string;
  marca: string;
  descripcion: string;
  cantidad: number;
  importeVendido: number;
}

export interface ReportRow extends ReportProduct {
  mes: string;
  precioVentaPromedio: number;
}

export interface SalesReport {
  filtros: SalesReportFilters;
  local: number;
  zonaHoraria: string;
  generadoEn: string;
  avisos: string[];
  categorias: string[];
  resumen: { importeVendido: number; unidadesVendidas: number; numeroVentas: number; lineasSinPrecioCompra: number; ventasVaciasOmitidas: number };
  mensual: { mes: string; cantidad: number; importeVendido: number; numeroVentas: number; ventasVaciasOmitidas: number }[];
  filas: ReportRow[];
  totalFilas: number;
  topCantidad: ReportProduct[];
  topImporte: ReportProduct[];
  page: number;
  xpage: number;
}

export interface SalesReportResponse { data: SalesReport; code: number; message: string; }
export interface ReportChartDatum { label: string; value: number; detail?: string; }
