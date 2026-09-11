import { Component, Inject, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Observable, Subject, finalize, takeUntil } from 'rxjs';
import { CashJournal, CashPaymentMethod, CashResponse } from 'src/app/models/internal/cash.model';
import { DataService } from 'src/app/services/data.service';
import { cashAmountValidator, amountValue, newOperationId, operationError } from 'src/app/shared/cash.utils';
import { expenseAmountValidator } from 'src/app/shared/expense.utils';

export type CashDialogMode = 'open' | 'close' | 'income' | 'withdrawal' | 'digital';
@Component({
  selector: 'app-modal-cash-operation',
  templateUrl: './modal-cash-operation.component.html',
  styleUrls: ['../modal-expense/modal-expense.component.scss', './modal-cash-operation.component.scss']
})
export class ModalCashOperationComponent implements OnDestroy {
  readonly operationId = newOperationId();
  readonly form = this.fb.nonNullable.group({
    monto: '', contado: '', fondo: '', motivo: '', observaciones: '',
    metodoPago: 'YAPE' as CashPaymentMethod, naturaleza: 'INGRESO' as 'INGRESO' | 'EGRESO'
  });
  readonly digitalMethods: { value: Exclude<CashPaymentMethod, 'EFECTIVO'>; label: string }[] = [
    { value: 'YAPE', label: 'Yape' }, { value: 'PLIN', label: 'Plin' },
    { value: 'TRANSFERENCIA', label: 'Transferencia' }, { value: 'TARJETA', label: 'Tarjeta' },
    { value: 'OTRO', label: 'Otro' }
  ];
  private readonly destroy$ = new Subject<void>();
  saving = false;
  refreshing = false;
  closedElsewhere = false;
  error = '';
  readonly titles: Record<CashDialogMode, string> = {
    open: 'Abrir caja', close: 'Cerrar caja', income: 'Ingreso de efectivo', withdrawal: 'Retiro de efectivo',
    digital: 'Movimiento no efectivo'
  };
  get title(): string { return this.titles[this.data.mode]; }
  get isManual(): boolean { return this.data.mode === 'income' || this.data.mode === 'withdrawal' || this.data.mode === 'digital'; }
  get isDigital(): boolean { return this.data.mode === 'digital'; }
  get expected(): number { return this.data.journal?.resumen.saldoEsperado ?? 0; }
  get counted(): number { return amountValue(this.form.controls.contado.value); }
  get difference(): number { return this.counted - this.expected; }
  get withdrawal(): number { return this.counted - amountValue(this.form.controls.fondo.value); }
  get openingDifference(): number { return amountValue(this.form.controls.monto.value) - (this.data.suggested ?? 0); }

  constructor(private fb: FormBuilder, private service: DataService,
    public dialogRef: MatDialogRef<ModalCashOperationComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: CashDialogMode; journal?: CashJournal; suggested?: number; hasPrevious?: boolean }) {
    this.form.controls.observaciones.setValidators(Validators.maxLength(1000));
    if (data.mode === 'close') {
      this.form.controls.contado.setValidators([Validators.required, cashAmountValidator]);
      this.form.controls.fondo.setValidators([Validators.required, cashAmountValidator]);
      this.form.controls.fondo.setValue('');
      this.form.setValidators(() => this.withdrawal < 0 ? { fund: true } : null);
    } else {
      this.form.controls.monto.setValidators([Validators.required, data.mode === 'open' ? cashAmountValidator : expenseAmountValidator]);
      if (data.mode === 'open') { this.form.controls.monto.setValue((data.suggested ?? 0).toFixed(2)); }
      if (this.isManual) {
        this.form.controls.motivo.setValidators([Validators.required, Validators.maxLength(250),
          control => String(control.value).trim().length >= 3 ? null : { reason: true }]);
      }
      if (this.isDigital) {
        this.form.controls.metodoPago.setValidators(Validators.required);
        this.form.controls.naturaleza.setValidators(Validators.required);
      }
    }
    Object.values(this.form.controls).forEach(control => control.updateValueAndValidity());
    this.form.updateValueAndValidity();
  }

  refreshSummary(): void {
    if (!this.data.journal || this.saving || this.refreshing) { return; }
    this.refreshing = true;
    this.service.getCashJournal(this.data.journal.id).pipe(takeUntil(this.destroy$),
      finalize(() => this.refreshing = false)).subscribe({
        next: response => {
          this.data.journal = response.data;
          this.closedElsewhere = response.data.estado === 'CERRADA';
          this.error = this.closedElsewhere ? 'Esta jornada ya fue cerrada. Puedes consultar su detalle.' : '';
        }, error: error => this.error = operationError(error)
      });
  }

  save(): void {
    if (this.saving || this.refreshing || this.closedElsewhere) { return; }
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const value = this.form.getRawValue();
    const base = { operacionId: this.operationId, observaciones: value.observaciones.trim() || null };
    let request: Observable<CashResponse<unknown>>;
    if (this.data.mode === 'open') {
      request = this.service.openCash({ ...base, montoApertura: amountValue(value.monto) });
    } else if (this.data.mode === 'close') {
      request = this.service.closeCash(this.data.journal!.id, { ...base,
        montoContado: amountValue(value.contado), fondoSiguiente: amountValue(value.fondo), version: this.data.journal!.version });
    } else {
      const type = this.isDigital ? (value.naturaleza === 'INGRESO' ? 'income' : 'withdrawal') : this.data.mode;
      request = this.service.cashMovement(this.data.journal!.id, type as 'income' | 'withdrawal', {
        ...base, monto: amountValue(value.monto), motivo: value.motivo.trim(),
        metodoPago: this.isDigital ? value.metodoPago : 'EFECTIVO' });
    }
    this.saving = true;
    this.error = '';
    this.form.disable({ emitEvent: false });
    this.dialogRef.disableClose = true;
    request.pipe(takeUntil(this.destroy$), finalize(() => {
      this.saving = false;
      this.form.enable({ emitEvent: false });
      this.dialogRef.disableClose = false;
    })).subscribe({ next: () => this.dialogRef.close(true), error: error => this.error = operationError(error) });
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}
