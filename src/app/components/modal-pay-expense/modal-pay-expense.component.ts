import { HttpErrorResponse } from '@angular/common/http';
import Swal from 'sweetalert2';
import { CASH_CLOSED_ALERT, isCashClosedError, newOperationId } from 'src/app/shared/cash.utils';
import { Component, Inject, OnDestroy } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subject, finalize, takeUntil } from 'rxjs';
import { ExpenseModel, ExpenseOptions, ExpensePaymentMethod } from 'src/app/models/internal/expense.model';
import { DataService } from 'src/app/services/data.service';
import { expenseDateValidator, expenseError, expenseToday } from 'src/app/shared/expense.utils';

@Component({
  selector: 'app-modal-pay-expense',
  templateUrl: './modal-pay-expense.component.html',
  styleUrls: ['../modal-expense/modal-expense.component.scss']
})
export class ModalPayExpenseComponent implements OnDestroy {
  readonly form = this.fb.group({
    metodoPago: this.fb.control<ExpensePaymentMethod | null>(null, Validators.required),
    fechaPago: this.fb.nonNullable.control(expenseToday(), [Validators.required, expenseDateValidator])
  });
  private readonly destroy$ = new Subject<void>();
  readonly operationId = newOperationId();
  saving = false;
  error = '';

  constructor(private fb: FormBuilder, private dataService: DataService,
    public dialogRef: MatDialogRef<ModalPayExpenseComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { expense: ExpenseModel; options: ExpenseOptions }) {}

  private handleSaveError(error: HttpErrorResponse): void {
    this.error = expenseError(error);
    if (!isCashClosedError(error)) { return; }
    void Swal.fire({
      title: 'Caja cerrada', text: CASH_CLOSED_ALERT, icon: 'warning',
      confirmButtonText: 'Entendido', confirmButtonColor: '#26874a'
    });
  }

  save(): void {
    if (this.saving) { return; }
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const value = this.form.getRawValue();
    this.saving = true;
    this.form.disable({ emitEvent: false });
    this.error = '';
    this.dialogRef.disableClose = true;
    this.dataService.payExpense(this.data.expense.id, {
      metodoPago: value.metodoPago!, fechaPago: value.fechaPago
    }, this.operationId).pipe(takeUntil(this.destroy$), finalize(() => {
      this.saving = false;
      this.form.enable({ emitEvent: false });
      this.dialogRef.disableClose = false;
    })).subscribe({
      next: () => this.dialogRef.close(true),
      error: error => this.handleSaveError(error)
    });
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}
