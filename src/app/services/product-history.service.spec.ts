import { HTTP_INTERCEPTORS, HttpErrorResponse } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { TokenInterceptor } from '../interceptors/token.interceptor';
import { AuthService } from './auth.service';
import { DataService } from './data.service';

describe('Product history request', () => {
  let http: HttpTestingController;
  let service: DataService;
  let auth: jasmine.SpyObj<AuthService>;
  let previousToken: string | null;
  beforeEach(() => {
    previousToken = localStorage.getItem('token'); localStorage.setItem('token', JSON.stringify('test-session'));
    auth = jasmine.createSpyObj('AuthService', ['refreshToken']);
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule], providers: [
      { provide: AuthService, useValue: auth }, { provide: HTTP_INTERCEPTORS, useClass: TokenInterceptor, multi: true }
    ] });
    http = TestBed.inject(HttpTestingController); service = TestBed.inject(DataService);
  });
  afterEach(() => {
    http.verify();
    if (previousToken === null) { localStorage.removeItem('token'); } else { localStorage.setItem('token', previousToken); }
  });

  it('sends the PIN in the body and surfaces wrong PIN without refreshing login', () => {
    let failure: HttpErrorResponse | undefined;
    service.loadProductHistory('product', '0000').subscribe({ error: error => failure = error });
    const request = http.expectOne(r => r.url.endsWith('/products/product/history'));
    expect(request.request.method).toBe('POST'); expect(request.request.body).toEqual({ pin: '0000' });
    expect(request.request.params.keys()).toEqual([]);
    expect(request.request.headers.get('Authorization')).toBe('Bearer test-session');
    request.flush({ detail: 'PIN incorrecto.' }, { status: 403, statusText: 'Forbidden' });
    expect(failure?.status).toBe(403); expect(auth.refreshToken).not.toHaveBeenCalled();
  });
});
