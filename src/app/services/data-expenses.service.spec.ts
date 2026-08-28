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
});
