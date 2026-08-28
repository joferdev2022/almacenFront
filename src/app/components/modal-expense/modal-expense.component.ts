import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Subject, finalize, takeUntil } from 'rxjs';
import { ExpenseModel, ExpenseOptions, ExpenseProvider } from 'src/app/models/internal/expense.model';
import { ExpenseRequest } from 'src/app/models/request/expense.request';
import { DataService } from 'src/app/services/data.service';
import { expenseAmountValidator, expenseDateInput, expenseDateValidator, expenseError, expenseToday } from 'src/app/shared/expense.utils';

export interface ExpenseDialogData {
  expense?: ExpenseModel;
  options: ExpenseOptions;
}

@Component({
  selector: 'app-modal-expense',
  templateUrl: './modal-expense.component.html',
  styleUrls: ['./modal-expense.component.scss']
})
export class ModalExpenseComponent implements OnInit, OnDestroy {
  readonly form: FormGroup;
  readonly providerSearch = this.fb.nonNullable.control('');
  private readonly destroy$ = new Subject<void>();
  saving = false;
  error = '';
  providers: ExpenseProvider[] = [];
  providersLoading = false;
  providerError = '';
  providerPage = 0;
  providerTotal = 0;
  loadedProviderCount = 0;
  activeProviderSearch = '';
  showMore: boolean;

  constructor(
    private fb: FormBuilder,
    private dataService: DataService,
    public dialogRef: MatDialogRef<ModalExpenseComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ExpenseDialogData
  ) {
    const expense = data.expense;
    this.form = this.fb.group({
      fecha: [expenseDateInput(expense?.fecha) || expenseToday(), [Validators.required, expenseDateValidator]],
      categoria: [expense?.categoria || '', Validators.required],
      descripcion: [expense?.descripcion || '', Validators.maxLength(250)],
      monto: [expense ? expense.monto.toFixed(2) : '', [Validators.required, expenseAmountValidator]],
      estado: [expense?.estado || 'PAGADO', Validators.required],
      metodoPago: [expense?.metodoPago || null],
      fechaPago: [expenseDateInput(expense?.fechaPago)],
      proveedorId: [expense?.proveedorId || null],
      tipoComprobante: [expense?.tipoComprobante || 'SIN_COMPROBANTE'],
      numeroComprobante: [expense?.numeroComprobante || '', Validators.maxLength(100)],
      observaciones: [expense?.observaciones || '', Validators.maxLength(2000)]
    });
    this.showMore = !!(expense?.proveedorId || expense?.numeroComprobante || expense?.observaciones ||
      (expense?.tipoComprobante && expense.tipoComprobante !== 'SIN_COMPROBANTE'));
    if (expense?.proveedorId) {
      this.providers = [{ id: expense.proveedorId, nombreProvider: expense.proveedorNombre || 'Proveedor registrado' }];
    }
    this.updatePaymentValidators();
  }

  ngOnInit(): void {
    this.form.controls['estado'].valueChanges.pipe(takeUntil(this.destroy$)).subscribe(() => this.updatePaymentValidators());
    this.form.controls['fecha'].valueChanges.pipe(takeUntil(this.destroy$)).subscribe(value => {
      if (!this.data.expense && this.isPaid && !this.form.controls['fechaPago'].dirty) {
        this.form.controls['fechaPago'].setValue(value);
      }
    });
    this.loadProviders();
  }

  get isPaid(): boolean { return this.form.controls['estado'].value === 'PAGADO'; }

  updatePaymentValidators(): void {
    const method = this.form.controls['metodoPago'];
    const date = this.form.controls['fechaPago'];
    method.setValidators(this.isPaid ? [Validators.required] : []);
    date.setValidators(this.isPaid ? [Validators.required, expenseDateValidator] : []);
    if (this.isPaid && !date.value) { date.setValue(this.form.controls['fecha'].value); }
    if (!this.isPaid) { date.setValue(''); }
    method.updateValueAndValidity();
    date.updateValueAndValidity();
  }

  invalid(field: string): boolean {
    const control = this.form.controls[field];
    return control.invalid && control.touched;
  }

  loadProviders(more = false): void {
    if (this.providersLoading) { return; }
    if (!more) { this.activeProviderSearch = this.providerSearch.value.trim(); }
    const page = more ? this.providerPage + 1 : 1;
    this.providersLoading = true;
    this.providerError = '';
    this.dataService.loadExpenseProviders(this.activeProviderSearch, page).pipe(
      takeUntil(this.destroy$), finalize(() => this.providersLoading = false)
    ).subscribe({
      next: response => {
        const selected = this.providers.find(item => item.id === this.form.controls['proveedorId'].value);
        const items = more ? [...this.providers, ...response.data.items] : response.data.items;
        if (selected && !items.some(item => item.id === selected.id)) { items.unshift(selected); }
        this.providers = Array.from(new Map(items.map(item => [item.id, item])).values());
        this.providerPage = page;
        this.providerTotal = response.data.total;
        this.loadedProviderCount = more ? this.loadedProviderCount + response.data.items.length : response.data.items.length;
      },
      error: error => this.providerError = expenseError(error)
    });
  }

  save(): void {
    if (this.saving) { return; }
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const value = this.form.getRawValue();
    const optional = (text: string) => text.trim() || null;
    const request: ExpenseRequest = {
      fecha: value.fecha, categoria: value.categoria, descripcion: optional(value.descripcion),
      monto: String(value.monto).trim().replace(',', '.'), estado: value.estado,
      metodoPago: value.metodoPago || null, fechaPago: this.isPaid ? value.fechaPago : null,
      proveedorId: value.proveedorId || null, tipoComprobante: value.tipoComprobante,
      numeroComprobante: optional(value.numeroComprobante), observaciones: optional(value.observaciones)
    };
    this.saving = true;
    this.form.disable({ emitEvent: false });
    this.error = '';
    this.dialogRef.disableClose = true;
    const operation = this.data.expense
      ? this.dataService.updateExpense(this.data.expense.id, request)
      : this.dataService.saveExpense(request);
    operation.pipe(takeUntil(this.destroy$), finalize(() => {
      this.saving = false;
      this.form.enable({ emitEvent: false });
      this.dialogRef.disableClose = false;
    })).subscribe({
      next: () => this.dialogRef.close(true),
      error: error => this.error = expenseError(error)
    });
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}
