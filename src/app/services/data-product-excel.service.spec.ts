import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { DataService } from './data.service';

describe('DataService Excel de productos', () => {
  let service: DataService;
  let http: HttpTestingController;
  const file = new File(['xlsx'], 'conteo.xlsx');
  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [HttpClientTestingModule] });
    service = TestBed.inject(DataService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('loads the latest persisted import for the selected local', () => {
    service.loadLatestProductImport(2).subscribe(response => expect(response.data).toBeNull());
    const request = http.expectOne(req => req.url.endsWith('/products/imports/latest'));
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('local')).toBe('2');
    request.flush({ data: null });
  });

  it('validates the selected file and local through the preview endpoint', () => {
    service.previewProductsExcel(file, 1).subscribe();
    const request = http.expectOne(req => req.url.endsWith('/products/preview-excel'));
    expect(request.request.method).toBe('POST');
    expect(request.request.body.get('file')).toBe(file);
    expect(request.request.body.get('local')).toBe('1');
    request.flush({ valid: false, errors: [] });
  });

  it('sends the preview catalog version when saving and propagates validation failures', () => {
    service.uploadProductsExcel(file, 1, 'catalog-version').subscribe({
      error: error => expect(error.status).toBe(422)
    });
    const request = http.expectOne(req => req.url.endsWith('/products/upload-excel'));
    expect(request.request.body.get('catalog_version')).toBe('catalog-version');
    expect(request.request.body.get('file')).toBe(file);
    request.flush({ detail: { errors: [] } }, { status: 422, statusText: 'Unprocessable Entity' });
  });
});
