import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Subject } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import { MaterialModule } from 'src/app/shared/material.module';
import { ModalPayExpenseComponent } from './modal-pay-expense.component';

describe('ModalPayExpenseComponent', () => {
  let fixture: ComponentFixture<ModalPayExpenseComponent>;
  let component: ModalPayExpenseComponent;
  let service: jasmine.SpyObj<DataService>;
  let payment: Subject<any>;

  beforeEach(async () => {
    payment = new Subject();
    service = jasmine.createSpyObj('DataService', ['payExpense']);
    service.payExpense.and.returnValue(payment);
    await TestBed.configureTestingModule({
      declarations: [ModalPayExpenseComponent],
      imports: [ReactiveFormsModule, MaterialModule, NoopAnimationsModule],
      providers: [{ provide: DataService, useValue: service },
        { provide: MatDialogRef, useValue: { close: jasmine.createSpy('close'), disableClose: false } },
        { provide: MAT_DIALOG_DATA, useValue: { expense: { id: 'pending-id', monto: 200 },
          options: { metodosPago: ['EFECTIVO', 'YAPE'] } } }]
    }).compileComponents();
    fixture = TestBed.createComponent(ModalPayExpenseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('requires both payment method and date', () => {
    component.form.patchValue({ fechaPago: '', metodoPago: null });
    component.save();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#payment-date-help').textContent).toContain('fecha válida');
    expect(fixture.nativeElement.querySelector('#payment-method-help').textContent).toContain('Selecciona');
    expect(service.payExpense).not.toHaveBeenCalled();
    expect(component.form.controls.metodoPago.hasError('required')).toBeTrue();
    expect(component.form.controls.fechaPago.hasError('required')).toBeTrue();
  });

  it('submits the selected payment only once', () => {
    component.form.patchValue({ fechaPago: '2026-08-29', metodoPago: 'YAPE' });
    component.save();
    component.save();
    expect(service.payExpense).toHaveBeenCalledOnceWith('pending-id', { fechaPago: '2026-08-29', metodoPago: 'YAPE' });
  });
});
