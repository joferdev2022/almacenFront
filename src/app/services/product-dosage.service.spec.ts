import { TestBed } from '@angular/core/testing';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DataService } from './data.service';
import { AuthService } from './auth.service';
import { TokenInterceptor } from '../interceptors/token.interceptor';

describe('DataService dosificación de productos', () => {
  let service: DataService;
  let http: HttpTestingController;
  let auth: jasmine.SpyObj<AuthService>;

  beforeEach(() => {
    auth = jasmine.createSpyObj('AuthService', ['refreshToken']);
    localStorage.setItem('token', JSON.stringify('token-de-prueba'));
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule], providers: [
      { provide: AuthService, useValue: auth },
      { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true }
    ] });
    service = TestBed.inject(DataService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => { http.verify(); localStorage.removeItem('token'); });

  it('loads only the chosen product using the login identity rather than a client local', () => {
    service.loadProductDosage('producto').subscribe();
    const request = http.expectOne(req => req.url.endsWith('/products/producto/dosages'));
    expect(request.request.method).toBe('GET');
    expect(request.request.params.has('local')).toBeFalse();
    expect(request.request.headers.get('Authorization')).toBe('Bearer token-de-prueba');
    request.flush({ data: {} });
  });

  it('saves the dosage version and surfaces 403 without refreshing or retrying the write', () => {
    const data = { version: 1, dosificaciones: [] };
    service.saveProductDosage('producto', data).subscribe({ error: error => expect(error.status).toBe(403) });
    const request = http.expectOne(req => req.url.endsWith('/products/producto/dosages'));
    expect(request.request.method).toBe('PUT');
    expect(request.request.body).toEqual(data);
    request.flush({ detail: 'No tienes permiso.' }, { status: 403, statusText: 'Forbidden' });
    expect(auth.refreshToken).not.toHaveBeenCalled();
  });
});
