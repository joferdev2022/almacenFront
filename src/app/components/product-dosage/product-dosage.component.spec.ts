import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, Subject, throwError } from 'rxjs';
import { DataService } from '../../services/data.service';
import { ProductDosage, ProductDosageEntry } from '../../models/internal/product-dosage.model';
import { ProductDosageComponent } from './product-dosage.component';

const entry: ProductDosageEntry = {
  cultivo: 'Uso de etiqueta', objetivo: 'Objetivo indicado', dosis: 'Dosis de ficha',
  baseAplicacion: 'Referencia indicada', aplicacion: 'Según etiqueta', observaciones: '', fuente: 'Ficha del producto'
};

describe('ProductDosageComponent', () => {
  let fixture: ComponentFixture<ProductDosageComponent>;
  let service: jasmine.SpyObj<DataService>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<ProductDosageComponent>>;
  const empty: ProductDosage = {
    producto: { id: 'producto', nombre: 'Producto seleccionado', unidadDeMedida: '50 KILOGRAMOS' },
    dosificaciones: [], version: 0, puedeEditar: true, actualizadoEn: null, actualizadoPor: null
  };
  const saved: ProductDosage = {
    ...empty, dosificaciones: [entry], version: 1, actualizadoEn: '2026-11-11T00:30:00Z',
    actualizadoPor: { id: 'usuario', nombre: 'Administrador' }
  };
  const component = () => fixture.componentInstance;
  const text = () => fixture.nativeElement.textContent as string;
  const load = (record: ProductDosage) => {
    service.loadProductDosage.and.returnValue(of({ data: record }));
    component().load();
    fixture.detectChanges();
  };

  beforeEach(async () => {
    service = jasmine.createSpyObj('DataService', ['loadProductDosage', 'saveProductDosage']);
    service.loadProductDosage.and.returnValue(of({ data: { ...empty } }));
    service.saveProductDosage.and.returnValue(of({ data: saved }));
    dialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    await TestBed.configureTestingModule({
      imports: [ProductDosageComponent, NoopAnimationsModule],
      providers: [
        { provide: DataService, useValue: service },
        { provide: MAT_DIALOG_DATA, useValue: { productId: 'producto' } },
        { provide: MatDialogRef, useValue: dialogRef }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(ProductDosageComponent);
    fixture.detectChanges();
  });

  it('loads only the selected product and offers creation for an empty editable record', () => {
    expect(service.loadProductDosage).toHaveBeenCalledOnceWith('producto');
    expect(text()).toContain('Producto seleccionado');
    expect(text()).toContain('Presentación: 50 KG');
    expect(text()).toContain('Sin dosificación registrada');
    expect(fixture.nativeElement.querySelector('.edit-dosage').textContent).toContain('Agregar dosificación');
    expect(service.saveProductDosage).not.toHaveBeenCalled();
  });

  it('allows reading multiple uses but hides editing when the server denies permission', () => {
    load({ ...saved, puedeEditar: false, dosificaciones: [entry, { ...entry, cultivo: 'Segundo uso' }] });
    expect(fixture.nativeElement.querySelectorAll('.dosage-card').length).toBe(2);
    expect(text()).toContain('Dosis de ficha');
    expect(text()).toContain('Referencia indicada');
    expect(text()).toContain('Solo lectura');
    expect(fixture.nativeElement.querySelector('.edit-dosage')).toBeNull();
    component().beginEdit();
    component().save();
    expect(component().editing).toBeFalse();
    expect(service.saveProductDosage).not.toHaveBeenCalled();
  });

  it('requires nonblank crop/use, dose and application base before saving', () => {
    fixture.nativeElement.querySelector('.edit-dosage').click();
    fixture.detectChanges();
    expect(component().entries.length).toBe(1);
    expect(fixture.nativeElement.querySelector('.save-dosage').disabled).toBeTrue();
    component().entries.at(0).patchValue({ cultivo: '  ', dosis: 'Dosis de ficha', baseAplicacion: 'Base indicada' });
    component().save();
    expect(service.saveProductDosage).not.toHaveBeenCalled();
    expect(component().form.invalid).toBeTrue();
  });

  it('saves explicit form submission with version and keeps the panel open for viewing', () => {
    const pending = new Subject<{ data: ProductDosage }>();
    service.saveProductDosage.and.returnValue(pending);
    component().beginEdit();
    component().entries.at(0).patchValue({ ...entry, cultivo: ' Uso de etiqueta ' });
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.save-dosage').click();
    component().save();
    fixture.detectChanges();
    expect(service.saveProductDosage).toHaveBeenCalledOnceWith('producto', { version: 0, dosificaciones: [entry] });
    expect(dialogRef.disableClose).toBeTrue();
    expect(fixture.nativeElement.querySelector('.cancel-edit').disabled).toBeTrue();
    expect(fixture.nativeElement.querySelector('.close').disabled).toBeTrue();
    expect(component().record?.dosificaciones).toEqual([]);
    pending.next({ data: saved });
    pending.complete();
    fixture.detectChanges();
    expect(component().editing).toBeFalse();
    expect(text()).toContain('Dosificación guardada correctamente');
    expect(text()).toContain('10/11/2026, 19:30');
    expect(text()).toContain('Administrador');
    expect(dialogRef.close).not.toHaveBeenCalled();
    expect(dialogRef.disableClose).toBeFalse();
  });

  it('discards edits without writing or mutating the displayed saved information', () => {
    load(saved);
    component().beginEdit();
    component().entries.at(0).patchValue({ dosis: 'Borrador sin guardar' });
    component().addEntry();
    component().cancelEdit();
    fixture.detectChanges();
    expect(service.saveProductDosage).not.toHaveBeenCalled();
    expect(component().record?.dosificaciones[0].dosis).toBe('Dosis de ficha');
    expect(text()).not.toContain('Borrador sin guardar');
    expect(fixture.nativeElement.querySelectorAll('.dosage-card').length).toBe(1);
  });

  it('keeps multiple uses and applies removals only when Save is pressed', () => {
    load({ ...saved, dosificaciones: [entry, { ...entry, cultivo: 'Segundo uso' }] });
    component().beginEdit();
    component().removeEntry(0);
    expect(service.saveProductDosage).not.toHaveBeenCalled();
    expect(component().record?.dosificaciones.length).toBe(2);
    component().save();
    expect(service.saveProductDosage).toHaveBeenCalledOnceWith('producto', {
      version: 1, dosificaciones: [{ ...entry, cultivo: 'Segundo uso' }]
    });
  });

  it('retains the draft on a concurrent change and reloads only after explicit discard', () => {
    load(saved);
    service.saveProductDosage.and.returnValue(throwError(() => ({ status: 409, error: { detail: 'La dosificación cambió.' } })));
    component().beginEdit();
    component().entries.at(0).patchValue({ dosis: 'Mi borrador' });
    component().save();
    fixture.detectChanges();
    expect(component().entries.at(0).get('dosis')?.value).toBe('Mi borrador');
    expect(component().record?.version).toBe(1);
    expect(text()).toContain('Tu borrador se conserva');
    expect(fixture.nativeElement.querySelector('.save-dosage').disabled).toBeTrue();
    service.loadProductDosage.and.returnValue(of({ data: { ...saved, version: 2, dosificaciones: [{ ...entry, dosis: 'Cambio de otra persona' }] } }));
    fixture.nativeElement.querySelector('.save-error button').click();
    fixture.detectChanges();
    expect(component().editing).toBeFalse();
    expect(text()).toContain('Cambio de otra persona');
  });

  it('shows permission changes without closing or silently resubmitting', () => {
    load(saved);
    service.saveProductDosage.and.returnValue(throwError(() => ({ status: 403, error: { detail: 'No tienes permiso para modificar dosificaciones.' } })));
    component().beginEdit();
    component().save();
    fixture.detectChanges();
    expect(text()).toContain('No tienes permiso');
    expect(fixture.nativeElement.querySelector('.save-dosage').disabled).toBeTrue();
    component().save();
    expect(service.saveProductDosage).toHaveBeenCalledTimes(1);
    expect(dialogRef.close).not.toHaveBeenCalled();
  });

  it('retries failed reads and cancels subscriptions when the panel is destroyed', () => {
    service.loadProductDosage.and.returnValue(throwError(() => ({ status: 404, error: { detail: 'Producto no encontrado.' } })));
    component().load();
    fixture.detectChanges();
    expect(text()).toContain('Producto no encontrado');
    const pending = new Subject<{ data: ProductDosage }>();
    service.loadProductDosage.and.returnValue(pending);
    fixture.nativeElement.querySelector('.load-error button').click();
    expect(component().loading).toBeTrue();
    const destroyed = component();
    fixture.destroy();
    pending.next({ data: saved });
    expect(destroyed.record).toBeNull();
  });
});
