import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginatorIntl, PageEvent } from '@angular/material/paginator';
import { Observable, Subject, catchError, combineLatest, debounceTime, finalize, of, startWith, switchMap, takeUntil } from 'rxjs';
import Swal from 'sweetalert2';
import { CashCurrent, CashJournal, CashMovement, CashPage, CashPaymentMethod } from 'src/app/models/internal/cash.model';
import { SaleModel } from 'src/app/models/internal/sale.model';
import { DataService } from 'src/app/services/data.service';
import { operationError } from 'src/app/shared/cash.utils';
import { expenseDateValidator } from 'src/app/shared/expense.utils';
import { ModalCashOperationComponent, CashDialogMode } from 'src/app/components/modal-cash-operation/modal-cash-operation.component';
import { ModalInfoExpenseComponent } from 'src/app/components/modal-info-expense/modal-info-expense.component';
import { ModalInfoSaleComponent } from 'src/app/components/modal-info-sale/modal-info-sale.component';

@Component({
  selector: 'app-cash', templateUrl: './cash.component.html',
  styleUrls: ['./cash-table.scss', './cash-summary.scss', './cash.component.scss'], providers: [MatPaginatorIntl]
})
export class CashComponent implements OnInit, OnDestroy {
  readonly nonCashMethods: { value: Exclude<CashPaymentMethod, 'EFECTIVO'>; label: string; image?: string; icon?: string }[] = [
    { value: 'YAPE', label: 'Yape', image: 'assets/icons/payment-methods/yape.png' },
    { value: 'PLIN', label: 'Plin', image: 'assets/icons/payment-methods/plin.png' },
    { value: 'TRANSFERENCIA', label: 'Transferencia', image: 'assets/icons/payment-methods/transferencia.png' },
    { value: 'TARJETA', label: 'Tarjeta', icon: 'credit_card' },
    { value: 'OTRO', label: 'Otro', image: 'assets/icons/payment-methods/otro.png' }
  ];
  readonly canWrite = Number(localStorage.getItem('permissions') || 0) === 1;
  readonly columns = ['fecha', 'responsable', 'apertura', 'ingresos', 'egresos', 'esperado', 'contado', 'diferencia', 'estado', 'acciones'];
  readonly filters = this.fb.nonNullable.group({
    fecha_desde: ['', expenseDateValidator], fecha_hasta: ['', expenseDateValidator], estado: ''
  }, { validators: group => {
    const from = group.get('fecha_desde')?.value, to = group.get('fecha_hasta')?.value;
    return from && to && from > to ? { range: true } : null;
  } });
  private readonly destroy$ = new Subject<void>();
  private readonly reload$ = new Subject<void>();
  view: 'current' | 'history' | 'detail' = 'current';
  current?: CashCurrent;
  journal?: CashJournal;
  journals: CashJournal[] = [];
  pageIndex = 0; pageSize = 10; total = 0; movementsRefresh = 0;
  loading = false; error = ''; sourceBusy = '';

  constructor(private service: DataService, private fb: FormBuilder, private route: ActivatedRoute,
    private dialog: MatDialog, paginator: MatPaginatorIntl) {
    paginator.itemsPerPageLabel = 'Jornadas por página';
    paginator.nextPageLabel = 'Siguiente'; paginator.previousPageLabel = 'Anterior';
    paginator.getRangeLabel = (page, size, length) => length ? `${page * size + 1}–${Math.min((page + 1) * size, length)} de ${length}` : '0 de 0';
  }

  ngOnInit(): void {
    combineLatest([this.route.paramMap, this.route.data, this.reload$.pipe(startWith(undefined))]).pipe(
      switchMap((): Observable<any> => {
        this.view = this.route.snapshot.data['view'] || 'current';
        this.loading = true; this.error = '';
        let request: Observable<any>;
        if (this.view === 'history') {
          request = this.service.loadCashHistory(this.pageIndex + 1, this.pageSize, this.filters.getRawValue());
        } else if (this.view === 'detail') {
          request = this.service.getCashJournal(this.route.snapshot.paramMap.get('id')!);
        } else { request = this.service.getCurrentCash(); }
        return request.pipe(catchError(error => { this.error = operationError(error); return of(null); }),
          finalize(() => this.loading = false));
      }), takeUntil(this.destroy$)
    ).subscribe(response => {
      this.current = undefined; this.journal = undefined; this.journals = []; this.total = 0;
      if (!response) { return; }
      if (this.view === 'current') { this.current = response.data; this.journal = this.current?.jornada || undefined; }
      else if (this.view === 'detail') { this.journal = response.data; }
      else { const page = response.data as CashPage<CashJournal>; this.journals = page.items; this.total = page.total; }
      this.movementsRefresh++;
    });
    this.filters.valueChanges.pipe(debounceTime(250), takeUntil(this.destroy$)).subscribe(() => {
      this.pageIndex = 0; if (this.filters.valid && this.view === 'history') { this.reload(); }
    });
  }

  reload(): void { if (this.view !== 'history' || this.filters.valid) { this.reload$.next(); } }
  clearFilters(): void { this.filters.reset(); }
  page(event: PageEvent): void { this.pageIndex = event.pageIndex; this.pageSize = event.pageSize; this.reload(); }

  operate(mode: CashDialogMode): void {
    if (!this.canWrite || this.loading || (mode !== 'open' && this.journal?.estado !== 'ABIERTA')) { return; }
    this.dialog.open(ModalCashOperationComponent, {
      width: '580px', maxWidth: '95vw', maxHeight: '94vh', panelClass: 'expense-dialog-panel',
      data: { mode, journal: this.journal, suggested: this.current?.fondoSugerido || 0, hasPrevious: !!this.current?.ultimoCierre }
    }).afterClosed().pipe(takeUntil(this.destroy$)).subscribe(saved => {
      this.reload();
      if (saved) { void Swal.fire({ icon: 'success', title: 'Operación registrada', timer: 1400, showConfirmButton: false }); }
    });
  }

  openSource(movement: CashMovement): void {
    if (!movement.origenId || this.sourceBusy) { return; }
    this.sourceBusy = movement.id;
    const request = movement.origenTipo === 'GASTO' ? this.service.getExpense(movement.origenId) : this.service.getSale(movement.origenId);
    request.pipe(takeUntil(this.destroy$), finalize(() => this.sourceBusy = '')).subscribe({
      next: response => {
        if (movement.origenTipo === 'GASTO') {
          this.dialog.open(ModalInfoExpenseComponent, { data: response.data, width: '640px', maxWidth: '95vw', panelClass: 'expense-dialog-panel' });
        } else {
          this.dialog.open(ModalInfoSaleComponent, { data: { data: SaleModel.createFromObject(response.data) },
            width: '650px', maxWidth: '95vw', maxHeight: '94vh' });
        }
      },
      error: error => { void Swal.fire('No se pudo abrir el origen', operationError(error), 'error'); }
    });
  }

  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}
