import { TestBed } from '@angular/core/testing';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DataService } from './data.service';
import { AuthService } from './auth.service';
import { TokenInterceptor } from '../interceptors/token.interceptor';
import { SalesReportFilters } from '../models/internal/report.model';

describe('DataService Reportes', () => {
  let service: DataService;
  let http: HttpTestingController;
  let auth: jasmine.SpyObj<AuthService>;
  const filters: SalesReportFilters = { fecha_desde: '2026-01-01', fecha_hasta: '2026-08-31', producto: 'Café & té', categoria: '', ventas: 'pagadas' };

  beforeEach(() => {
    auth = jasmine.createSpyObj('AuthService', ['refreshToken']);
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule], providers: [
      { provide: AuthService, useValue: auth }, { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true }
    ] });
    service = TestBed.inject(DataService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('envía filtros y paginación al servidor, sin local elegido por el cliente', () => {
    service.loadSalesReport(filters, 2, 10).subscribe();
    const request = http.expectOne(req => req.url.endsWith('/reports/sales'));
    expect(request.request.params.get('producto')).toBe('Café & té');
    expect(request.request.params.get('fecha_desde')).toBe('2026-01-01');
    expect(request.request.params.get('page')).toBe('2');
    expect(request.request.params.get('xpage')).toBe('10');
    expect(request.request.params.get('ventas')).toBe('pagadas');
    expect(request.request.params.has('categoria')).toBeFalse();
    expect(request.request.params.has('local')).toBeFalse();
    request.flush({ data: {}, code: 200 });
  });

  it('descarga un blob con los mismos filtros, sin limitarlo a la página visible', () => {
    service.downloadSalesReport({ ...filters, categoria: 'Alimentos' }).subscribe(blob => expect(blob instanceof Blob).toBeTrue());
    const request = http.expectOne(req => req.url.endsWith('/reports/sales/excel'));
    expect(request.request.responseType).toBe('blob');
    expect(request.request.params.get('producto')).toBe(filters.producto);
    expect(request.request.params.get('categoria')).toBe('Alimentos');
    expect(request.request.params.get('ventas')).toBe('pagadas');
    expect(request.request.params.has('page')).toBeFalse();
    request.flush(new Blob(['xlsx']));
  });

  it('propaga 403 en consulta y Excel sin intentar renovar la sesión', () => {
    service.loadSalesReport(filters).subscribe({ error: error => expect(error.status).toBe(403) });
    http.expectOne(req => req.url.endsWith('/reports/sales')).flush({ detail: 'Sin permiso' }, { status: 403, statusText: 'Forbidden' });
    service.downloadSalesReport(filters).subscribe({ error: error => expect(error.status).toBe(403) });
    http.expectOne(req => req.url.endsWith('/reports/sales/excel')).flush(new Blob(['Sin permiso']), { status: 403, statusText: 'Forbidden' });
    expect(auth.refreshToken).not.toHaveBeenCalled();
  });
});
