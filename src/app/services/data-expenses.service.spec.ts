import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { DataService } from './data.service';
import { AuthService } from './auth.service';
import { TokenInterceptor } from '../interceptors/token.interceptor';

describe('DataService Gastos', () => {
  let service: DataService;
  let http: HttpTestingController;
  let auth: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    auth = jasmine.createSpyObj('AuthService', ['refreshToken']);
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [{ provide: AuthService, useValue: auth },
        { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true }]
    });
    service = TestBed.inject(DataService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('maps the existing response envelope and sends server-side filters', () => {
    service.loadExpenses(2, 10, { search: 'Internet Perú', estado: 'PAGADO', categoria: '' })
      .subscribe(result => expect(result.data).toEqual([]));
    const request = http.expectOne(req => req.url.endsWith('/expenses'));
    expect(request.request.params.get('page')).toBe('2');
    expect(request.request.params.get('search')).toBe('Internet Perú');
    expect(request.request.params.has('categoria')).toBeFalse();
    expect(request.request.params.has('local')).toBeFalse();
    request.flush({ data: [[]], total: 0, page: 2, xpage: 10, resumen: {}, code: 200, message: '' });
  });

  it('passes expense permission errors through without calling the login refresh', () => {
    let status = 0;
    service.deleteExpense('test-id').subscribe({ error: error => status = error.status });
    http.expectOne(req => req.url.endsWith('/expenses/test-id'))
      .flush({ detail: 'No tienes permiso' }, { status: 403, statusText: 'Forbidden' });
    expect(status).toBe(403);
    expect(auth.refreshToken).not.toHaveBeenCalled();
  });

  it('mantiene permisos de Caja y Ventas sin renovar el login', () => {
    for (const request of [
      { url: '/cash/current', call: () => service.getCurrentCash() },
      { url: '/sales/venta', call: () => service.getSale('venta') }
    ]) {
      request.call().subscribe({ error: error => expect(error.status).toBe(403) });
      http.expectOne(req => req.url.endsWith(request.url))
        .flush({ detail: 'Sin permiso' }, { status: 403, statusText: 'Forbidden' });
    }
    expect(auth.refreshToken).not.toHaveBeenCalled();
  });

  it('envía el identificador estable y el motivo al anular', () => {
    service.deleteSaleById('venta', 'Devolución acordada', 'operacion-prueba').subscribe();
    const request = http.expectOne(req => req.url.endsWith('/sales/venta'));
    expect(request.request.method).toBe('DELETE');
    expect(request.request.body).toEqual({ motivo: 'Devolución acordada' });
    expect(request.request.headers.get('Idempotency-Key')).toBe('operacion-prueba');
    request.flush({data:{anulado:true},code:200});
  });

  it('pide movimientos paginados y no acepta un local elegido por el cliente', () => {
    service.loadCashMovements('jornada', 2, 25, { tipo:'GASTO_EFECTIVO', fecha_desde:'2026-08-28', naturaleza:'' }).subscribe();
    const request = http.expectOne(req => req.url.endsWith('/cash/jornada/movements'));
    expect(request.request.params.get('page')).toBe('2');
    expect(request.request.params.get('xpage')).toBe('25');
    expect(request.request.params.get('tipo')).toBe('GASTO_EFECTIVO');
    expect(request.request.params.has('local')).toBeFalse();
    request.flush({data:{items:[],total:0,page:2,xpage:25},code:200});
  });
});
