import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, Subject, throwError } from 'rxjs';
import Swal from 'sweetalert2';
import { DataService } from '../../services/data.service';
import { MaterialModule } from '../../shared/material.module';
import { ProductsComponent } from './products.component';
import { ProductExcelImport } from '../../models/internal/product-excel.model';
import { ProductModel } from '../../models/internal/product.model';

describe('ProductsComponent Excel result', () => {
  let fixture: ComponentFixture<ProductsComponent>;
  let service: jasmine.SpyObj<DataService>;
  let dialog: jasmine.SpyObj<MatDialog>;
  const saved: ProductExcelImport = {
    id: 'import-1', local: 1, filename: 'conteo.xlsx', imported_at: '2026-11-05T00:30:00Z',
    inserted_count: 2, updated_count: 100, zeroed_count: 98, total_processed: 102
  };
  beforeEach(async () => {
    localStorage.setItem('local', '1');
    service = jasmine.createSpyObj('DataService', ['loadProducts', 'loadLatestProductImport']);
    service.loadProducts.and.returnValue(of({ data: [], total: 0, page: 1, xpage: 10 } as any));
    service.loadLatestProductImport.and.returnValue(of({ data: null }));
    dialog = jasmine.createSpyObj('MatDialog', ['open']);
    await TestBed.configureTestingModule({
      declarations: [ProductsComponent], imports: [MaterialModule, NoopAnimationsModule],
      providers: [{ provide: DataService, useValue: service }, { provide: MatDialog, useValue: dialog }]
    }).compileComponents();
    fixture = TestBed.createComponent(ProductsComponent);
    fixture.detectChanges();
    spyOn(Swal, 'fire');
  });
  afterEach(() => localStorage.removeItem('local'));

  it('refreshes and shows the real server result once after a successful import', () => {
    dialog.open.and.returnValue({ afterClosed: () => of({ inserted_count: 2, updated_count: 100, zeroed_count: 98 }) } as any);
    fixture.componentInstance.openDialogPinUploadExcel();
    expect(service.loadProducts).toHaveBeenCalledTimes(2);
    expect(service.loadLatestProductImport).toHaveBeenCalledTimes(2);
    expect(Swal.fire).toHaveBeenCalledTimes(1);
  });

  it('does not announce success or refresh when the import is cancelled', () => {
    dialog.open.and.returnValue({ afterClosed: () => of(undefined) } as any);
    fixture.componentInstance.openDialogPinUploadExcel();
    expect(service.loadProducts).toHaveBeenCalledTimes(1);
    expect(service.loadLatestProductImport).toHaveBeenCalledTimes(1);
    expect(Swal.fire).not.toHaveBeenCalled();
  });

  it('shows a clear empty state for the selected local before its first recorded import', () => {
    expect(service.loadLatestProductImport).toHaveBeenCalledOnceWith(1);
    expect(fixture.nativeElement.querySelector('.last-import').textContent).toContain('Sin importaciones registradas para este local.');
  });

  it('displays existing long or unspaced product measures as 50 KG in the table', () => {
    for (const measure of ['50 KILOGRAMOS', '50KG']) {
      const product = ProductModel.createFromObject({
        id: 'papa', nombre: 'PAPA SIERRA CERES', unidadDeMedida: measure,
        descripcion: '', categoria: 'Fertilizantes', precioCompra: 120, precioVenta: 158, cantidadEnStock: 0
      });
      service.loadProducts.and.returnValue(of({ data: [product], total: 1, page: 1, xpage: 10 } as any));
      fixture.componentInstance.loadAllProducts();
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelector('td.mat-column-measure').textContent.trim()).toBe('50 KG');
    }
  });

  it('renders the persisted UTC date in Lima time including the previous calendar day', () => {
    service.loadLatestProductImport.and.returnValue(of({ data: saved }));
    fixture.componentInstance.loadLastImport();
    fixture.detectChanges();
    const text = fixture.nativeElement.querySelector('.last-import').textContent;
    expect(text).toContain('04/11/2026, 19:30');
    expect(text).toContain('hora de Lima');
    expect(text).toContain('conteo.xlsx');
    expect(text).toContain('2 nuevos');
    expect(text).toContain('100 actualizados');
    expect(text).toContain('98 dejados en cero');
  });

  it('loads the saved record again when the Products page is recreated', () => {
    service.loadLatestProductImport.and.returnValue(of({ data: saved }));
    const reloaded = TestBed.createComponent(ProductsComponent);
    reloaded.detectChanges();
    expect(reloaded.nativeElement.querySelector('.last-import').textContent).toContain('conteo.xlsx');
    expect(service.loadLatestProductImport).toHaveBeenCalledTimes(2);
    reloaded.destroy();
  });

  it('refreshes the last import after saving and ignores an older pending response', () => {
    const pending = new Subject<{ data: ProductExcelImport | null }>();
    service.loadLatestProductImport.and.returnValues(pending, of({ data: saved }));
    fixture.componentInstance.loadLastImport();
    dialog.open.and.returnValue({ afterClosed: () => of(saved) } as any);
    fixture.componentInstance.openDialogPinUploadExcel();
    pending.next({ data: { ...saved, filename: 'anterior.xlsx' } });
    pending.complete();
    fixture.detectChanges();
    expect(fixture.componentInstance.lastImport?.filename).toBe('conteo.xlsx');
    expect(fixture.nativeElement.querySelector('.last-import').textContent).not.toContain('anterior.xlsx');
  });

  it('distinguishes lookup failure from an empty history and allows retrying', () => {
    service.loadLatestProductImport.and.returnValue(throwError(() => new Error('isolated error')));
    fixture.componentInstance.loadLastImport();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.last-import').textContent).toContain('No se pudo consultar');
    expect(fixture.nativeElement.querySelector('.last-import').textContent).not.toContain('Sin importaciones');
    service.loadLatestProductImport.and.returnValue(of({ data: saved }));
    fixture.nativeElement.querySelector('.last-import button').click();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.last-import').textContent).toContain('conteo.xlsx');
  });

  it('loads metadata for another local without keeping the previous local record', () => {
    fixture.componentInstance.local = 2;
    service.loadLatestProductImport.and.returnValue(of({ data: { ...saved, local: 2, filename: 'local-2.xlsx' } }));
    fixture.componentInstance.loadLastImport();
    fixture.detectChanges();
    expect(service.loadLatestProductImport).toHaveBeenCalledWith(2);
    expect(fixture.nativeElement.querySelector('.last-import').textContent).toContain('local-2.xlsx');
  });
});
