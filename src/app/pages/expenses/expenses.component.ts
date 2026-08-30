import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginatorIntl, PageEvent } from '@angular/material/paginator';
import { Subject, catchError, debounceTime, finalize, of, startWith, switchMap, takeUntil } from 'rxjs';
import Swal from 'sweetalert2';
import { ModalExpenseComponent } from 'src/app/components/modal-expense/modal-expense.component';
import { ModalInfoExpenseComponent } from 'src/app/components/modal-info-expense/modal-info-expense.component';
import { ModalPayExpenseComponent } from 'src/app/components/modal-pay-expense/modal-pay-expense.component';
import { ExpenseModel, ExpenseOptions, ExpenseSummary } from 'src/app/models/internal/expense.model';
import { DataService } from 'src/app/services/data.service';
import { expenseDateValidator, expenseError } from 'src/app/shared/expense.utils';

@Component({
  selector: 'app-expenses',
  providers: [MatPaginatorIntl],
  templateUrl: './expenses.component.html',
  styleUrls: ['./expenses.component.scss', './expenses-table.scss']
})
export class ExpensesComponent implements OnInit, OnDestroy {
  readonly displayedColumns = ['fecha', 'descripcion', 'categoria', 'proveedor', 'estado', 'metodo', 'monto', 'acciones'];
  readonly filters = this.fb.nonNullable.group({
    search: ['', Validators.maxLength(100)], fecha_desde: ['', expenseDateValidator],
    fecha_hasta: ['', expenseDateValidator], categoria: '', estado: '', metodo_pago: ''
  }, { validators: group => {
    const from = group.get('fecha_desde')?.value;
    const to = group.get('fecha_hasta')?.value;
    return from && to && from > to ? { range: true } : null;
  } });
  readonly canWrite = Number(localStorage.getItem('permissions') || 0) === 1;
  private readonly destroy$ = new Subject<void>();
  private readonly reload$ = new Subject<void>();
  expenses: ExpenseModel[] = [];
  options?: ExpenseOptions;
  summary: ExpenseSummary = this.emptySummary();
  total = 0;
  pageIndex = 0;
  pageSize = 10;
  loading = false;
  error = '';
  optionsError = '';
  busyId: string | null = null;

  constructor(private fb: FormBuilder, private dataService: DataService,
    public dialog: MatDialog, paginator: MatPaginatorIntl) {
    paginator.itemsPerPageLabel = 'Gastos por página';
    paginator.nextPageLabel = 'Página siguiente';
    paginator.previousPageLabel = 'Página anterior';
    paginator.firstPageLabel = 'Primera página';
    paginator.lastPageLabel = 'Última página';
    paginator.getRangeLabel = (page, size, length) => !length || !size
      ? '0 de ' + length
      : (page * size + 1) + '–' + Math.min((page + 1) * size, length) + ' de ' + length;
  }

  get hasActiveFilters(): boolean {
    return Object.values(this.filters.getRawValue()).some(value => value !== '');
  }

  ngOnInit(): void {
    this.loadOptions();
    this.reload$.pipe(
      startWith(undefined),
      switchMap(() => {
        this.loading = true;
        this.error = '';
        return this.dataService.loadExpenses(this.pageIndex + 1, this.pageSize, this.filters.getRawValue()).pipe(
          catchError(error => {
            this.error = expenseError(error);
            return of(null);
          }),
          finalize(() => this.loading = false)
        );
      }),
      takeUntil(this.destroy$)
    ).subscribe(response => {
      this.expenses = response?.data || [];
      this.total = response?.total || 0;
      this.summary = response?.resumen || this.emptySummary();
    });
    this.filters.valueChanges.pipe(debounceTime(300), takeUntil(this.destroy$)).subscribe(() => {
      this.pageIndex = 0;
      if (this.filters.valid) { this.reload(); }
    });
  }

  loadOptions(): void {
    this.optionsError = '';
    this.dataService.loadExpenseOptions().pipe(takeUntil(this.destroy$)).subscribe({
      next: response => this.options = response.data,
      error: error => this.optionsError = expenseError(error)
    });
  }

  reload(): void {
    if (this.filters.valid) { this.reload$.next(); }
  }

  clearFilters(): void {
    this.filters.reset({ search: '', fecha_desde: '', fecha_hasta: '', categoria: '', estado: '', metodo_pago: '' },
      { emitEvent: false });
    this.pageIndex = 0;
    this.reload();
  }

  changePage(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.reload();
  }

  create(): void {
    if (!this.options || !this.canWrite) { return; }
    const ref = this.dialog.open(ModalExpenseComponent, {
      width: '760px', maxWidth: '96vw', maxHeight: '94vh', panelClass: 'expense-dialog-panel', autoFocus: 'dialog', data: { options: this.options }
    });
    ref.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(saved => {
      if (saved) { this.pageIndex = 0; this.reload(); this.success('Gasto registrado correctamente.'); }
    });
  }

  open(expense: ExpenseModel, action: 'view' | 'edit' | 'pay'): void {
    if (this.busyId || (action !== 'view' && (!this.options || !this.canWrite))) { return; }
    this.busyId = expense.id;
    this.dataService.getExpense(expense.id).pipe(
      takeUntil(this.destroy$), finalize(() => this.busyId = null)
    ).subscribe({
      next: response => {
        if (action === 'view') {
          this.dialog.open(ModalInfoExpenseComponent, {
            width: '650px', maxWidth: '96vw', maxHeight: '94vh', panelClass: 'expense-dialog-panel', autoFocus: 'dialog', data: response.data
          });
          return;
        }
        if (action === 'pay' && response.data.estado !== 'PENDIENTE') {
          this.reload();
          void Swal.fire('Gasto actualizado', 'Este gasto ya no está pendiente.', 'info');
          return;
        }
        const config = {
          width: action === 'edit' ? '760px' : '480px', maxWidth: '96vw', maxHeight: '94vh', panelClass: 'expense-dialog-panel', autoFocus: 'dialog',
          data: { expense: response.data, options: this.options! }
        };
        const ref = action === 'edit'
          ? this.dialog.open(ModalExpenseComponent, config)
          : this.dialog.open(ModalPayExpenseComponent, config);
        ref.afterClosed().pipe(takeUntil(this.destroy$)).subscribe(saved => {
          if (saved) { this.reload(); this.success(action === 'edit' ? 'Gasto actualizado.' : 'Pago registrado.'); }
        });
      },
      error: error => { void Swal.fire('No se pudo abrir el gasto', expenseError(error), 'error'); }
    });
  }

  async remove(expense: ExpenseModel): Promise<void> {
    if (!this.canWrite || this.busyId) { return; }
    const confirmation = await Swal.fire({
      title: '¿Eliminar este gasto?',
      text: 'Se conservará el gasto y su historial. El efectivo registrado se reintegrará a la caja abierta actual.',
      input: 'textarea', inputLabel: 'Motivo de anulación',
      inputValidator: value => value.trim().length >= 3 ? null : 'Escribe un motivo de al menos 3 caracteres.',
      icon: 'warning', showCancelButton: true,
      confirmButtonText: 'Sí, anular', cancelButtonText: 'Cancelar'
    });
    if (!confirmation.isConfirmed) { return; }
    this.busyId = expense.id;
    this.dataService.deleteExpense(expense.id, String(confirmation.value)).pipe(
      takeUntil(this.destroy$), finalize(() => this.busyId = null)
    ).subscribe({
      next: () => {
        if (this.expenses.length === 1 && this.pageIndex > 0) { this.pageIndex--; }
        this.reload();
        this.success('Gasto anulado.');
      },
      error: error => { void Swal.fire('No se pudo anular', expenseError(error), 'error'); }
    });
  }

  private success(message: string): void {
    void Swal.fire({ icon: 'success', title: message, timer: 1600, showConfirmButton: false });
  }

  private emptySummary(): ExpenseSummary {
    return { registrados: 0, pagados: 0, pendientes: 0, pagadosEfectivo: 0 };
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}
