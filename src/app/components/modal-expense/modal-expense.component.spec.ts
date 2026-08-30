import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { HttpErrorResponse } from '@angular/common/http';
import { of, Subject } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import { MaterialModule } from 'src/app/shared/material.module';
import Swal from 'sweetalert2';
import { ExpenseDialogData, ModalExpenseComponent } from './modal-expense.component';

describe('ModalExpenseComponent', () => {
  let fixture: ComponentFixture<ModalExpenseComponent>;
  let component: ModalExpenseComponent;
  let service: jasmine.SpyObj<DataService>;
  let dialog: { close: jasmine.Spy; disableClose: boolean };
  let operation: Subject<any>;
  const data: ExpenseDialogData = {
    options: { categorias: ['Servicios'], estados: ['PAGADO', 'PENDIENTE'],
      metodosPago: ['EFECTIVO', 'TRANSFERENCIA'], tiposComprobante: ['FACTURA', 'SIN_COMPROBANTE'] }
  };

  beforeEach(async () => {
    operation = new Subject();
    service = jasmine.createSpyObj('DataService', ['loadExpenseProviders', 'saveExpense', 'updateExpense']);
    service.loadExpenseProviders.and.returnValue(of({ data: { items: [], total: 0, page: 1, xpage: 20 }, code: 200, message: '' }));
    service.saveExpense.and.returnValue(operation);
    service.updateExpense.and.returnValue(operation);
    dialog = { close: jasmine.createSpy('close'), disableClose: false };
    await TestBed.configureTestingModule({
      declarations: [ModalExpenseComponent],
      imports: [ReactiveFormsModule, MaterialModule, NoopAnimationsModule],
      providers: [{ provide: DataService, useValue: service }, { provide: MatDialogRef, useValue: dialog },
        { provide: MAT_DIALOG_DATA, useValue: data }]
    }).compileComponents();
    fixture = TestBed.createComponent(ModalExpenseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => { data.expense = undefined; });

  function validPaid(): void {
    component.form.patchValue({ fecha: '2026-08-28', categoria: 'Servicios', monto: '50', metodoPago: 'EFECTIVO' });
  }

  it('requires a method for paid expenses and defaults the payment date', () => {
    component.form.patchValue({ categoria: 'Servicios', monto: '50' });
    expect(component.form.invalid).toBeTrue();
    expect(component.form.controls['metodoPago'].hasError('required')).toBeTrue();
    expect(component.form.controls['fechaPago'].value).toBe(component.form.controls['fecha'].value);
  });

  it('accepts a pending expense with no method and clears the payment date', () => {
    component.form.patchValue({ categoria: 'Servicios', monto: '200', estado: 'PENDIENTE' });
    expect(component.form.valid).toBeTrue();
    component.save();
    expect(service.saveExpense.calls.mostRecent().args[0].fechaPago).toBeNull();
    expect(service.saveExpense.calls.mostRecent().args[0].metodoPago).toBeNull();
  });

  it('rejects zero, negative, extra decimals and invalid amounts', () => {
    for (const amount of ['0', '-100', '1.001', 'NaN', 'Infinity', '1e3', '10000000000']) {
      component.form.controls['monto'].setValue(amount);
      expect(component.form.controls['monto'].invalid).withContext(amount).toBeTrue();
    }
  });

  it('accepts comma decimals and does not send user or local identifiers', () => {
    validPaid();
    component.form.controls['monto'].setValue('50,25');
    component.save();
    const request = service.saveExpense.calls.mostRecent().args[0];
    expect(request.monto).toBe('50.25');
    expect(Object.keys(request)).not.toContain('local');
    expect(Object.keys(request)).not.toContain('usuarioId');
  });

  it('prevents double submission and keeps the dialog open while saving', () => {
    validPaid();
    component.save();
    component.save();
    fixture.detectChanges();
    expect(service.saveExpense).toHaveBeenCalledTimes(1);
    expect(dialog.disableClose).toBeTrue();
    expect(dialog.close).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('.icon-button').disabled).toBeTrue();
    expect(fixture.nativeElement.querySelector('fieldset').disabled).toBeTrue();
    expect(fixture.nativeElement.querySelector('button[type="submit"]').disabled).toBeTrue();
    operation.next({ data: {} });
    expect(dialog.close).toHaveBeenCalledWith(true);
  });

  it('displays the backend error and allows retrying without closing', () => {
    validPaid();
    component.save();
    operation.error(new HttpErrorResponse({ status: 422, error: { detail: 'El proveedor no existe en tu local.' } }));
    fixture.detectChanges();
    expect(component.saving).toBeFalse();
    expect(dialog.disableClose).toBeFalse();
    expect(dialog.close).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('El proveedor no existe');
  });

  it('avisa claramente cuando un gasto en efectivo encuentra la Caja cerrada', () => {
    const alert = spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true } as any));
    validPaid();
    component.save();
    operation.error(new HttpErrorResponse({ status: 409,
      error: { detail: 'No existe una caja abierta para registrar esta operación en efectivo.' } }));
    fixture.detectChanges();
    expect(component.saving).toBeFalse();
    expect(component.form.enabled).toBeTrue();
    expect(component.form.controls['monto'].value).toBe('50');
    expect(component.error).toContain('No existe una caja abierta');
    expect(alert).toHaveBeenCalledWith(jasmine.objectContaining({
      title: 'Caja cerrada', icon: 'warning', confirmButtonText: 'Entendido'
    }));
  });

  it('reports invalid access without incorrectly claiming that the session expired', () => {
    validPaid();
    component.save();
    operation.error(new HttpErrorResponse({ status: 401 }));
    fixture.detectChanges();
    expect(component.saving).toBeFalse();
    expect(dialog.close).not.toHaveBeenCalled();
    const message = fixture.nativeElement.querySelector('[role="alert"]').textContent;
    expect(message).toContain('No se pudo validar el acceso a Gastos.');
    expect(message).not.toContain('vencido');
  });

  it('updates an existing expense using the same form', () => {
    data.expense = { id: 'expense-id' } as any;
    validPaid();
    component.form.patchValue({ numeroComprobante: 'F001-123', observaciones: 'Detalle' });
    component.save();
    expect(service.saveExpense).not.toHaveBeenCalled();
    expect(service.updateExpense.calls.mostRecent().args[0]).toBe('expense-id');
    expect(service.updateExpense.calls.mostRecent().args[1].observaciones).toBe('Detalle');
  });

  it('loads saved fields and preserves the recorded payment date when editing the expense date', () => {
    fixture.destroy();
    data.expense = {
      id: 'saved-id', fecha: '2026-08-27T00:00:00-05:00', fechaPago: '2026-08-28T00:00:00-05:00',
      monto: 50.25, estado: 'PAGADO', metodoPago: 'TRANSFERENCIA', categoria: 'Servicios',
      descripcion: 'Internet', numeroComprobante: 'F001-123', tipoComprobante: 'FACTURA',
      observaciones: 'Detalle guardado'
    } as any;
    fixture = TestBed.createComponent(ModalExpenseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.form.controls['monto'].value).toBe('50.25');
    expect(component.form.controls['numeroComprobante'].value).toBe('F001-123');
    component.form.controls['fecha'].setValue('2026-08-26');
    expect(component.form.controls['fechaPago'].value).toBe('2026-08-28');
  });

  it('requires method and date again when changing pending to paid', () => {
    component.form.controls['estado'].setValue('PENDIENTE');
    component.form.controls['estado'].setValue('PAGADO');
    expect(component.form.controls['metodoPago'].hasError('required')).toBeTrue();
    component.form.controls['fechaPago'].setValue('');
    expect(component.form.controls['fechaPago'].hasError('required')).toBeTrue();
  });
  it('shows field errors with accessible labels in the compact form', () => {
    component.form.controls['monto'].setValue('0');
    component.form.markAllAsTouched();
    fixture.detectChanges();
    const input: HTMLInputElement = fixture.nativeElement.querySelector('#expense-amount');
    expect(input.labels?.[0].textContent).toContain('Monto');
    expect(input.getAttribute('aria-invalid')).toBe('true');
    expect(fixture.nativeElement.querySelector('#expense-amount-help').textContent).toContain('mayor a cero');
    expect(fixture.nativeElement.querySelector('#expense-category-help').textContent).toContain('Selecciona una categoría');
  });

  it('switches the payment section when the displayed state changes', () => {
    expect(fixture.nativeElement.querySelector('#expense-payment-date')).not.toBeNull();
    component.form.controls['estado'].setValue('PENDIENTE');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#expense-payment-date')).toBeNull();
    expect(fixture.nativeElement.querySelector('.payment-note').textContent).toContain('no representa una salida de dinero');
    expect(fixture.nativeElement.querySelector('#expense-method-label').textContent).toContain('(opcional)');
    component.form.controls['estado'].setValue('PAGADO');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#expense-payment-date')).not.toBeNull();
    expect(fixture.nativeElement.querySelector('.payment-note')).toBeNull();
  });

  it('preserves optional fields when collapsing and reopening more information', () => {
    const details: HTMLDetailsElement = fixture.nativeElement.querySelector('details');
    component.form.controls['observaciones'].setValue('Comprobante por entregar');
    details.open = true;
    details.dispatchEvent(new Event('toggle'));
    fixture.detectChanges();
    expect(component.showMore).toBeTrue();
    details.open = false;
    details.dispatchEvent(new Event('toggle'));
    fixture.detectChanges();
    expect(component.showMore).toBeFalse();
    details.open = true;
    details.dispatchEvent(new Event('toggle'));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#expense-notes').value).toBe('Comprobante por entregar');
  });

});
