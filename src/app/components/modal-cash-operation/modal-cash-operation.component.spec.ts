import { FormBuilder } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { HttpErrorResponse } from '@angular/common/http';
import { of, Subject } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import { CashJournal } from 'src/app/models/internal/cash.model';
import { CashDialogMode, ModalCashOperationComponent } from './modal-cash-operation.component';

describe('Formulario de Caja', () => {
  let component: ModalCashOperationComponent;
  let service: jasmine.SpyObj<DataService>;
  let operation: Subject<any>;
  let dialog: any;
  const journal = { id: 'jornada', version: 4, estado: 'ABIERTA', resumen: { saldoEsperado: 300 } } as CashJournal;
  function create(mode: CashDialogMode): void {
    component = new ModalCashOperationComponent(new FormBuilder(), service, dialog as MatDialogRef<ModalCashOperationComponent>,
      { mode, journal: { ...journal }, suggested: 200, hasPrevious: true });
  }
  beforeEach(() => {
    operation = new Subject();
    service = jasmine.createSpyObj('DataService', ['openCash', 'closeCash', 'cashMovement', 'getCashJournal']);
    service.openCash.and.returnValue(operation);
    service.closeCash.and.returnValue(operation);
    service.cashMovement.and.returnValue(operation);
    dialog = { close: jasmine.createSpy('close'), disableClose: false };
  });
  afterEach(() => component?.ngOnDestroy());

  it('sugiere el fondo anterior y permite una apertura en cero', () => {
    create('open');
    expect(component.form.controls.monto.value).toBe('200.00');
    component.form.controls.monto.setValue('190');
    expect(component.openingDifference).toBe(-10);
    component.form.controls.monto.setValue('0');
    expect(component.form.valid).toBeTrue();
  });
  it('rechaza retiros sin motivo, cero, negativos o con más de dos decimales', () => {
    create('withdrawal');
    component.form.patchValue({ monto: '10', motivo: '  ' });
    expect(component.form.invalid).toBeTrue();
    component.form.controls.motivo.setValue('Depósito');
    for (const amount of ['0', '-10', '1.001', 'NaN', '10000000000']) {
      component.form.controls.monto.setValue(amount);
      expect(component.form.invalid).withContext(amount).toBeTrue();
    }
    component.form.controls.monto.setValue('10,50');
    expect(component.form.valid).toBeTrue();
  });
  it('calcula diferencia y retiro final sin permitir un fondo mayor al conteo', () => {
    create('close');
    component.form.patchValue({ contado: '295', fondo: '200' });
    expect(component.difference).toBe(-5);
    expect(component.withdrawal).toBe(95);
    component.save();
    expect(service.closeCash.calls.mostRecent().args).toEqual(['jornada', jasmine.objectContaining({
      montoContado: 295, fondoSiguiente: 200, version: 4
    })]);
  });
  it('bloquea un fondo superior al contado', () => {
    create('close');
    component.form.patchValue({ contado: '295', fondo: '296' });
    component.save();
    expect(component.form.hasError('fund')).toBeTrue();
    expect(service.closeCash).not.toHaveBeenCalled();
  });
  it('bloquea doble envío y conserva la operación al reintentar un error de red', () => {
    create('income');
    component.form.patchValue({ monto: '10', motivo: 'Fondo adicional' });
    component.save(); component.save();
    expect(service.cashMovement).toHaveBeenCalledTimes(1);
    expect(component.form.disabled).toBeTrue();
    expect(dialog.disableClose).toBeTrue();
    const id = service.cashMovement.calls.mostRecent().args[2].operacionId;
    operation.error(new HttpErrorResponse({ status: 0 }));
    expect(component.error).toContain('conectar');
    expect(component.saving).toBeFalse();
    service.cashMovement.and.returnValue(of({ data: {} as any, code: 200, message: '' }));
    component.save();
    expect(service.cashMovement.calls.mostRecent().args[2].operacionId).toBe(id);
    expect(dialog.close).toHaveBeenCalledWith(true);
  });
  it('actualiza la versión del cierre y bloquea jornadas cerradas por otro usuario', () => {
    create('close');
    service.getCashJournal.and.returnValue(of({ data: { ...journal, version: 7 }, code: 200, message: '' }));
    component.refreshSummary();
    expect(component.data.journal?.version).toBe(7);
    service.getCashJournal.and.returnValue(of({ data: { ...journal, estado: 'CERRADA' }, code: 200, message: '' }));
    component.refreshSummary();
    component.form.patchValue({ contado: '295', fondo: '200' });
    component.save();
    expect(component.closedElsewhere).toBeTrue();
    expect(service.closeCash).not.toHaveBeenCalled();
  });
});
