import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpErrorResponse } from '@angular/common/http';
import { of, Subject, throwError } from 'rxjs';
import { DataService } from '../../services/data.service';
import { MaterialModule } from '../../shared/material.module';
import { SalesReport, SalesReportFilters, SalesReportResponse } from '../../models/internal/report.model';
import { defaultReportFilters } from '../../shared/report.utils';
import { ReportsComponent } from './reports.component';
import { ReportChartComponent } from './report-chart.component';

function response(filters = defaultReportFilters(), page = 1, size = 25): SalesReportResponse {
  return { code: 200, message: '', data: {
    filtros: { ...filters }, local: 1, zonaHoraria: 'America/Lima', generadoEn: '', categorias: ['Alimentos'],
    avisos: ['Ventas, no cobros de caja.'],
    resumen: { importeVendido: 112, unidadesVendidas: 6, numeroVentas: 2, lineasSinPrecioCompra: 1, ventasVaciasOmitidas: 0 },
    mensual: [{ mes: '2026-01', importeVendido: 112, cantidad: 6, numeroVentas: 2, ventasVaciasOmitidas: 0 }],
    filas: [{ mes: '2026-01', productoId: 'historico', producto: 'Café histórico', categoriaActual: null,
      cantidad: 5, importeVendido: 106, precioVentaPromedio: 21.2, precioCompraActual: null,
      presentacion: '', marca: '', descripcion: '' }],
    totalFilas: 42, topCantidad: [], topImporte: [], page, xpage: size
  } };
}

describe('ReportsComponent', () => {
  let fixture: ComponentFixture<ReportsComponent>;
  let component: ReportsComponent;
  let service: jasmine.SpyObj<DataService>;
  beforeEach(async () => {
    service = jasmine.createSpyObj('DataService', ['loadSalesReport', 'downloadSalesReport']);
    service.loadSalesReport.and.callFake((filters, page, size) => of(response(filters, page, size)));
    service.downloadSalesReport.and.returnValue(of(new Blob(['xlsx'])));
    await TestBed.configureTestingModule({ declarations: [ReportsComponent, ReportChartComponent],
      imports: [ReactiveFormsModule, NoopAnimationsModule, MaterialModule], providers: [{ provide: DataService, useValue: service }]
    }).compileComponents();
    fixture = TestBed.createComponent(ReportsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('muestra totales y tres gráficos sin precio de compra ni aviso informativo', () => {
    expect(fixture.nativeElement.querySelector('.summary-grid').textContent).toContain('112.00');
    expect(fixture.nativeElement.querySelector('.cost-notice')).toBeNull();
    expect(fixture.nativeElement.querySelector('.table-scroll thead').textContent).not.toContain('Compra');
    expect(fixture.nativeElement.textContent).not.toContain('referencial');
    expect(fixture.nativeElement.querySelectorAll('.table-scroll thead th').length).toBe(6);
    expect(fixture.nativeElement.querySelectorAll('app-report-chart').length).toBe(3);
    expect(component.report?.totalFilas).toBe(42);
    expect(component.report?.filas.length).toBe(1);
  });

  it('solo aplica filtros al confirmar y bloquea descargas con cambios pendientes', () => {
    const calls = service.loadSalesReport.calls.count();
    component.pageIndex = 3;
    component.filters.controls.producto.setValue('Bolsa');
    fixture.detectChanges();
    expect(service.loadSalesReport.calls.count()).toBe(calls);
    expect(component.pendingFilters).toBeTrue();
    expect(component.canDownload).toBeFalse();
    component.download();
    expect(service.downloadSalesReport).not.toHaveBeenCalled();
    component.applyFilters();
    expect(component.pageIndex).toBe(0);
    expect(service.loadSalesReport.calls.mostRecent().args[0].producto).toBe('Bolsa');
    expect(component.pendingFilters).toBeFalse();
  });

  it('informa ventas vacías omitidas sin bloquear gráficos ni la descarga', () => {
    const result = response();
    const notice = 'Ventas vacías omitidas: 4. Sin productos, con total y total original de S/ 0.00.';
    result.data.resumen.ventasVaciasOmitidas = 4;
    result.data.mensual[0].ventasVaciasOmitidas = 4;
    result.data.avisos.push(notice);
    service.loadSalesReport.and.returnValue(of(result));
    component.applyFilters(); fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain(notice);
    expect(fixture.nativeElement.querySelector('[role="alert"]')).toBeNull();
    expect(fixture.nativeElement.querySelectorAll('app-report-chart').length).toBe(3);
    expect(component.report?.resumen.numeroVentas).toBe(2);
    expect(component.canDownload).toBeTrue();
    service.loadSalesReport.and.returnValue(of(response()));
    component.applyFilters(); fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('Ventas vacías omitidas');
  });

  it('valida fechas obligatorias, orden y máximo de 60 meses', () => {
    const calls = service.loadSalesReport.calls.count();
    for (const dates of [ { fecha_desde: '', fecha_hasta: '' },
      { fecha_desde: '2026-08-31', fecha_hasta: '2026-01-01' },
      { fecha_desde: '2020-01-01', fecha_hasta: '2026-08-31' } ]) {
      component.filters.patchValue(dates);
      component.applyFilters();
      expect(component.filters.invalid).toBeTrue();
    }
    expect(service.loadSalesReport.calls.count()).toBe(calls);
    component.resetFilters();
    expect(component.filters.valid).toBeTrue();
    expect(component.filters.getRawValue()).toEqual(defaultReportFilters());
  });

  it('solicita páginas con los filtros aplicados y conserva los totales completos', () => {
    component.changePage({ pageIndex: 2, pageSize: 10, length: 42 });
    expect(service.loadSalesReport.calls.mostRecent().args.slice(1)).toEqual([3, 10]);
    expect(component.report?.resumen.importeVendido).toBe(112);
    expect(component.pageIndex).toBe(2);
  });

  it('aplica el tipo de ventas a los indicadores, páginas y descarga sin perderlo', () => {
    component.filters.controls.ventas.setValue('pagadas');
    expect(component.pendingFilters).toBeTrue();
    expect(component.canDownload).toBeFalse();
    component.applyFilters(); fixture.detectChanges();
    expect(service.loadSalesReport.calls.mostRecent().args[0].ventas).toBe('pagadas');
    expect(fixture.nativeElement.querySelector('.sales-total small').textContent).toBe('Solo ventas pagadas');
    component.changePage({ pageIndex: 1, pageSize: 10, length: 42 });
    expect(service.loadSalesReport.calls.mostRecent().args[0].ventas).toBe('pagadas');
    const pending = new Subject<Blob>(); service.downloadSalesReport.and.returnValue(pending);
    component.download();
    expect(service.downloadSalesReport.calls.mostRecent().args[0].ventas).toBe('pagadas');
    pending.complete(); component.resetFilters(); fixture.detectChanges();
    expect(component.filters.controls.ventas.value).toBe('todas');
    expect(fixture.nativeElement.querySelector('.sales-total small').textContent).toBe('Incluye ventas a crédito');
  });

  it('cancela respuestas antiguas sin apagar el indicador de la nueva consulta', () => {
    const first = new Subject<SalesReportResponse>();
    const second = new Subject<SalesReportResponse>();
    service.loadSalesReport.and.returnValues(first, second);
    component.applyFilters();
    component.applyFilters();
    expect(first.observers.length).toBe(0);
    expect(component.loading).toBeTrue();
    const latest = response(); latest.data.resumen.importeVendido = 50;
    second.next(latest);
    first.next(response());
    expect(component.report?.resumen.importeVendido).toBe(50);
    second.complete();
    expect(component.loading).toBeFalse();
  });

  it('no presenta errores de carga como ventas cero', () => {
    service.loadSalesReport.and.returnValue(throwError(() => new HttpErrorResponse({ status: 0 })));
    component.applyFilters(); fixture.detectChanges();
    expect(component.report).toBeNull();
    expect(fixture.nativeElement.querySelector('.summary-grid')).toBeNull();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('No se pudo conectar');
    expect(component.canDownload).toBeFalse();
  });

  it('muestra estado vacío y permite descargar el reporte vacío', () => {
    const empty = response();
    empty.data.filas = []; empty.data.totalFilas = 0;
    empty.data.resumen = { importeVendido: 0, unidadesVendidas: 0, numeroVentas: 0, lineasSinPrecioCompra: 0, ventasVaciasOmitidas: 4 };
    empty.data.avisos.push('Ventas vacías omitidas: 4.');
    service.loadSalesReport.and.returnValue(of(empty));
    component.applyFilters(); fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.empty-state').textContent).toContain('Sin ventas');
    expect(fixture.nativeElement.textContent).toContain('Ventas vacías omitidas: 4.');
    expect(component.canDownload).toBeTrue();
  });

  it('exporta el filtro completo aplicado y libera el enlace de descarga', fakeAsync(() => {
    const create = spyOn(URL, 'createObjectURL').and.returnValue('blob:test-report');
    const revoke = spyOn(URL, 'revokeObjectURL');
    let filename = '';
    spyOn(HTMLAnchorElement.prototype, 'click').and.callFake(function(this: HTMLAnchorElement) { filename = this.download; });
    const download = new Subject<Blob>();
    service.downloadSalesReport.and.returnValue(download);
    component.changePage({ pageIndex: 2, pageSize: 10, length: 42 });
    component.download(); component.download();
    expect(service.downloadSalesReport.calls.count()).toBe(1);
    expect(service.downloadSalesReport.calls.mostRecent().args[0]).toEqual(component.report!.filtros);
    component.filters.controls.producto.setValue('Nuevo filtro');
    download.next(new Blob(['xlsx'])); download.complete();
    expect(filename).toContain(`ventas_local_1_${component.report!.filtros.fecha_desde}`);
    expect(create).toHaveBeenCalled();
    expect(document.querySelector('a[download]')).toBeNull();
    tick(1000); expect(revoke).toHaveBeenCalledWith('blob:test-report');
    expect(component.exporting).toBeFalse();
  }));

  it('muestra el error de descarga y permite reintentar', fakeAsync(() => {
    service.downloadSalesReport.and.returnValue(throwError(() => new HttpErrorResponse({ status: 403 })));
    component.download(); tick(); fixture.detectChanges();
    expect(component.downloadError).toContain('No tienes permiso');
    expect(component.exporting).toBeFalse();
    expect(component.canDownload).toBeTrue();
  }));

  it('ordena el ranking por importe sin cambiar filtros ni consultar de nuevo', () => {
    const product = component.report!.filas[0];
    component.report!.topCantidad = [{ ...product, producto: 'Más unidades' }];
    component.report!.topImporte = [{ ...product, producto: 'Más importe', importeVendido: 200 }];
    component.rankingMetric = 'importe';
    expect(component.rankingData[0].label).toBe('Más importe');
    expect(component.rankingData[0].value).toBe(200);
  });

  it('cancela la consulta al salir de la pantalla', () => {
    const pending = new Subject<SalesReportResponse>(); service.loadSalesReport.and.returnValue(pending);
    component.applyFilters(); fixture.destroy();
    expect(pending.observers.length).toBe(0);
  });
});

describe('ReportChartComponent', () => {
  it('representa meses sin ventas sin NaN o infinito', () => {
    const chart = new ReportChartComponent();
    chart.data = [{ label: 'ene 2026', value: 0 }, { label: 'feb 2026', value: 0 }];
    chart.ngOnChanges();
    expect(chart.polyline).not.toMatch(/NaN|Infinity/);
    expect(chart.points.every(point => point.y === 200)).toBeTrue();
  });
  it('amplía el gráfico para rangos largos y mantiene los valores exactos', () => {
    const chart = new ReportChartComponent(); chart.currency = true;
    chart.data = Array.from({ length: 60 }, (_, index) => ({ label: `mes ${index}`, value: index * 100 }));
    chart.ngOnChanges();
    expect(chart.width).toBeGreaterThan(3000);
    expect(chart.points[59].y).toBe(40);
    expect(chart.format(12.5)).toContain('12.50');
  });
});
