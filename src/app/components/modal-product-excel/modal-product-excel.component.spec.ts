import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, Subject, throwError } from 'rxjs';
import { DataService } from '../../services/data.service';
import { MaterialModule } from '../../shared/material.module';
import { ProductExcelPreview, ProductExcelResult } from '../../models/internal/product-excel.model';
import { ModalProductExcelComponent } from './modal-product-excel.component';

describe('ModalProductExcelComponent', () => {
  let component: ModalProductExcelComponent;
  let fixture: ComponentFixture<ModalProductExcelComponent>;
  let service: jasmine.SpyObj<DataService>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<ModalProductExcelComponent>>;
  const file = new File(['xlsx'], 'inventario.XLSX');
  const valid: ProductExcelPreview = {
    valid: true, errors: [], catalog_version: 'version', total_processed: 1,
    inserted_count: 0, updated_count: 1, zeroed_count: 1,
    preview: [
      { row: 2, code: 'arroz', name: 'Arroz', presentation: 'KG', stock_before: 8, stock_after: 12, action: 'update' },
      { row: null, code: 'sal', name: 'Sal', presentation: 'KG', stock_before: 9, stock_after: 0, action: 'zero' }
    ]
  };

  beforeEach(async () => {
    localStorage.setItem('local', '1');
    service = jasmine.createSpyObj('DataService', ['previewProductsExcel', 'uploadProductsExcel']);
    dialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    service.previewProductsExcel.and.returnValue(of(valid));
    await TestBed.configureTestingModule({
      declarations: [ModalProductExcelComponent],
      imports: [MaterialModule, NoopAnimationsModule],
      providers: [
        { provide: DataService, useValue: service },
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { operation: 'excel' } }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(ModalProductExcelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => localStorage.removeItem('local'));

  it('reads the existing JSON local storage format for numeric and text local identifiers', () => {
    expect(component.local).toBe(1);
    localStorage.setItem('local', JSON.stringify('2'));
    const other = TestBed.createComponent(ModalProductExcelComponent);
    expect(other.componentInstance.local).toBe(2);
    other.destroy();
  });

  it('requires selecting and validating a file before importing', () => {
    component.onUpload();
    expect(service.uploadProductsExcel).not.toHaveBeenCalled();
    component.setFile(file);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.btn-upload').disabled).toBeTrue();
    expect(fixture.nativeElement.textContent).toContain('Una CANTIDAD vacía se interpreta como 0');
  });

  it('shows row and column errors and blocks every write including duplicates', () => {
    service.previewProductsExcel.and.returnValue(of({ ...valid, valid: false, preview: [], errors: [
      { row: 7, column: 'P. VENTA', message: 'Este precio es obligatorio.' },
      { row: 250, column: 'PRODUCTO / PRESENTACION', message: 'Duplicado: coincide con la fila 212.' }
    ] }));
    component.setFile(file);
    component.onValidate();
    fixture.detectChanges();
    const rows: NodeListOf<HTMLTableRowElement> = fixture.nativeElement.querySelectorAll('.validation-errors tbody tr');
    expect(rows.length).toBe(2);
    expect(rows[0].textContent).toContain('7');
    expect(rows[0].textContent).toContain('P. VENTA');
    expect(rows[1].textContent).toContain('212');
    component.onUpload();
    expect(service.uploadProductsExcel).not.toHaveBeenCalled();
    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  it('previews omitted products at zero without importing automatically', () => {
    component.setFile(file);
    component.onValidate();
    fixture.detectChanges();
    expect(service.previewProductsExcel).toHaveBeenCalledOnceWith(file, 1);
    expect(service.uploadProductsExcel).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('.zero-row').textContent).toContain('Sal');
    expect(fixture.nativeElement.querySelector('.zero-row').textContent).toContain('Dejar en cero');
    expect(fixture.nativeElement.querySelector('.btn-upload').disabled).toBeFalse();
  });

  it('shows the registered products responsible for a catalog conflict and keeps importing blocked', () => {
    service.previewProductsExcel.and.returnValue(of({ ...valid, valid: false, preview: [], errors: [{
      row: 64, column: 'PRODUCTO / PRESENTACION', message: 'Hay 2 productos registrados como DEFFOL / 4 LT.',
      conflicts: [
        { code: 'codigo-principal', name: 'DEFFOL', presentation: '4 LT', stock: 10, category: 'HERBICIDA' },
        { code: 'codigo-duplicado', name: 'DEFFOL', presentation: '4 LITROS', stock: 5, category: '' }
      ]
    }] }));
    component.setFile(file);
    component.onValidate();
    fixture.detectChanges();
    const details = fixture.nativeElement.querySelector('.catalog-conflicts');
    expect(details.textContent).toContain('DEFFOL / 4 LT');
    expect(details.textContent).toContain('codigo-principal');
    expect(details.textContent).toContain('codigo-duplicado');
    expect(details.textContent).toContain('Stock: 10');
    expect(details.textContent).toContain('Stock: 5');
    expect(details.textContent).toContain('HERBICIDA');
    expect(details.querySelectorAll('li').length).toBe(2);
    expect(component.status).toContain('Se encontró 1 error');
    expect(fixture.nativeElement.querySelector('.btn-upload').disabled).toBeTrue();
    component.onUpload();
    expect(service.uploadProductsExcel).not.toHaveBeenCalled();
    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  it('keeps the dialog open until the server confirms saving and prevents double submission', () => {
    const pending = new Subject<ProductExcelResult>();
    service.uploadProductsExcel.and.returnValue(pending);
    component.setFile(file);
    component.onValidate();
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.btn-upload').click();
    component.onUpload();
    fixture.detectChanges();
    expect(service.uploadProductsExcel).toHaveBeenCalledOnceWith(file, 1, 'version');
    expect(dialogRef.close).not.toHaveBeenCalled();
    expect(dialogRef.disableClose).toBeTrue();
    expect(fixture.nativeElement.querySelector('.btn-cancel').disabled).toBeTrue();
    pending.next({ inserted_count: 0, updated_count: 1, zeroed_count: 1, total_processed: 1 });
    pending.complete();
    expect(dialogRef.close).toHaveBeenCalledOnceWith({ inserted_count: 0, updated_count: 1, zeroed_count: 1, total_processed: 1 });
    expect(component.busy).toBeNull();
  });

  it('invalidates the previous preview after another file is selected', () => {
    component.setFile(file);
    component.onValidate();
    component.setFile(new File(['other'], 'otro.xlsx'));
    component.onUpload();
    expect(component.validation).toBeNull();
    expect(service.uploadProductsExcel).not.toHaveBeenCalled();
    component.setFile(new File(['bad'], 'archivo.txt'));
    expect(component.file).toBeNull();
    expect(component.status).toContain('Formato inválido');
  });

  it('renders validation errors returned during saving and leaves the dialog open', () => {
    service.uploadProductsExcel.and.returnValue(throwError(() => ({ error: { detail: {
      errors: [{ row: 3, column: 'PRODUCTO', message: 'Este dato es obligatorio.' }]
    } } })));
    component.setFile(file);
    component.onValidate();
    component.onUpload();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.validation-errors').textContent).toContain('PRODUCTO');
    expect(component.validation?.valid).toBeFalse();
    expect(dialogRef.close).not.toHaveBeenCalled();
    expect(dialogRef.disableClose).toBeFalse();
  });

  it('requires a new validation if stock changed after the preview', () => {
    service.uploadProductsExcel.and.returnValue(throwError(() => ({ error: { detail: 'El inventario cambió. Valida nuevamente.' } })));
    component.setFile(file);
    component.onValidate();
    component.onUpload();
    fixture.detectChanges();
    expect(component.validation).toBeNull();
    expect(component.status).toContain('Valida nuevamente');
    expect(fixture.nativeElement.querySelector('.btn-upload').disabled).toBeTrue();
    expect(dialogRef.close).not.toHaveBeenCalled();
  });
});
