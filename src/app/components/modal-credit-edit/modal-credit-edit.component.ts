import { HttpErrorResponse } from '@angular/common/http';
import { Component, Inject, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subject, finalize, takeUntil } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import { ExpensePaymentMethod } from 'src/app/models/internal/expense.model';
import { expenseAmountValidator, expenseDateValidator, expenseToday } from 'src/app/shared/expense.utils';
import Swal from 'sweetalert2';
import { amountValue, CASH_CLOSED_ALERT, isCashClosedError, newOperationId, operationError } from 'src/app/shared/cash.utils';

@Component({
  selector: 'app-modal-credit-edit',
  templateUrl: './modal-credit-edit.component.html',
  styleUrls: ['../modal-expense/modal-expense.component.scss']
})
export class ModalCreditEditComponent implements OnDestroy {
  readonly operationId = newOperationId();
  readonly form = this.fb.group({
    monto: ['', [Validators.required, expenseAmountValidator]],
    metodoPago: this.fb.control<ExpensePaymentMethod | null>(null, Validators.required),
    fechaPago: [expenseToday(), [Validators.required, expenseDateValidator]]
  });
  methods: ExpensePaymentMethod[] = [];
  saving = false;
  error = '';
  optionsError = '';
  private readonly destroy$ = new Subject<void>();
  get debt(): number { return this.data.saleCredit.saldoPendiente ?? this.data.saleCredit.totalPrice; }
  get remaining(): number { return this.debt - amountValue(this.form.controls.monto.value); }

  constructor(private fb: FormBuilder, private service: DataService,
    public dialogRef: MatDialogRef<ModalCreditEditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) { this.loadMethods(); }

  loadMethods(): void {
    this.optionsError = '';
    this.service.loadExpenseOptions().pipe(takeUntil(this.destroy$)).subscribe({
      next: response => this.methods = response.data.metodosPago,
      error: error => this.optionsError = operationError(error)
    });
  }

  private handleSaveError(error: HttpErrorResponse): void {
    this.error = operationError(error);
    if (!isCashClosedError(error)) { return; }
    void Swal.fire({
      title: 'Caja cerrada', text: CASH_CLOSED_ALERT, icon: 'warning',
      confirmButtonText: 'Entendido', confirmButtonColor: '#26874a'
    });
  }

  save(): void {
    if (this.saving) { return; }
    if (this.form.invalid || this.remaining < 0 || !this.methods.length) { this.form.markAllAsTouched(); return; }
    const value = this.form.getRawValue();
    this.saving = true;
    this.error = '';
    this.form.disable({ emitEvent: false });
    this.dialogRef.disableClose = true;
    this.service.updatePaymentSaleById(this.data.saleCredit.id, {
      monto: amountValue(value.monto), metodoPago: value.metodoPago!, fechaPago: value.fechaPago!
    }, this.operationId).pipe(takeUntil(this.destroy$), finalize(() => {
      this.saving = false;
      this.form.enable({ emitEvent: false });
      this.dialogRef.disableClose = false;
    })).subscribe({ next: () => this.dialogRef.close(true), error: error => this.handleSaveError(error) });
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}
