import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatPaginatorIntl, PageEvent } from '@angular/material/paginator';
import { Subject, catchError, debounceTime, finalize, of, startWith, switchMap, takeUntil } from 'rxjs';
import { CashMovement, CashPaymentMethod } from 'src/app/models/internal/cash.model';
import { DataService } from 'src/app/services/data.service';
import { operationError } from 'src/app/shared/cash.utils';
import { expenseDateValidator } from 'src/app/shared/expense.utils';

@Component({
  selector: 'app-cash-movements', templateUrl: './cash-movements.component.html',
  styleUrls: ['./cash-table.scss', './cash-movements.component.scss'], providers: [MatPaginatorIntl]
})
export class CashMovementsComponent implements OnInit, OnChanges, OnDestroy {
  @Input() journalId = '';
  @Input() refresh = 0;
  @Input() sourceBusy = '';
  @Output() openSource = new EventEmitter<CashMovement>();
  readonly columns = ['fecha', 'descripcion', 'origen', 'metodo', 'ingreso', 'egreso', 'usuario'];
  readonly types: Record<string, string> = {
    VENTA_EFECTIVO: 'Venta en efectivo', GASTO_EFECTIVO: 'Gasto en efectivo',
    VENTA_NO_EFECTIVO: 'Venta no efectiva', GASTO_NO_EFECTIVO: 'Gasto no efectivo',
    INGRESO_MANUAL: 'Ingreso manual', RETIRO: 'Retiro', AJUSTE_ENTRADA: 'Ajuste de entrada',
    INGRESO_NO_EFECTIVO: 'Ingreso no efectivo', EGRESO_NO_EFECTIVO: 'Egreso no efectivo',
    AJUSTE_SALIDA: 'Ajuste de salida', RETIRO_CIERRE: 'Retiro de cierre'
  };
  readonly methods: { value: CashPaymentMethod; label: string }[] = [
    { value: 'EFECTIVO', label: 'Efectivo' }, { value: 'YAPE', label: 'Yape' },
    { value: 'PLIN', label: 'Plin' }, { value: 'TRANSFERENCIA', label: 'Transferencia' },
    { value: 'TARJETA', label: 'Tarjeta' }, { value: 'OTRO', label: 'Otro' }
  ];
  readonly filters = this.fb.nonNullable.group({
    fecha_desde: ['', expenseDateValidator], fecha_hasta: ['', expenseDateValidator],
    tipo: '', naturaleza: '', origen_tipo: '', metodo_pago: ''
  }, { validators: group => {
    const from = group.get('fecha_desde')?.value, to = group.get('fecha_hasta')?.value;
    return from && to && from > to ? { range: true } : null;
  } });
  private readonly destroy$ = new Subject<void>();
  private readonly reload$ = new Subject<void>();
  rows: CashMovement[] = [];
  total = 0; pageIndex = 0; pageSize = 10;
  loading = false; error = '';

  constructor(private fb: FormBuilder, private service: DataService, paginator: MatPaginatorIntl) {
    paginator.itemsPerPageLabel = 'Movimientos por página';
    paginator.nextPageLabel = 'Siguiente'; paginator.previousPageLabel = 'Anterior';
    paginator.getRangeLabel = (page, size, length) => length ? `${page * size + 1}–${Math.min((page + 1) * size, length)} de ${length}` : '0 de 0';
  }

  ngOnInit(): void {
    this.reload$.pipe(startWith(undefined), switchMap(() => {
      if (!this.journalId || this.filters.invalid) { return of(null); }
      this.loading = true; this.error = '';
      return this.service.loadCashMovements(this.journalId, this.pageIndex + 1, this.pageSize, this.filters.getRawValue())
        .pipe(catchError(error => { this.error = operationError(error); return of(null); }),
          finalize(() => this.loading = false));
    }), takeUntil(this.destroy$)).subscribe(response => {
      this.rows = response?.data.items || []; this.total = response?.data.total || 0;
    });
    this.filters.valueChanges.pipe(debounceTime(250), takeUntil(this.destroy$)).subscribe(() => {
      this.pageIndex = 0; if (this.filters.valid) { this.reload(); }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['journalId']) { this.pageIndex = 0; }
    if (changes['journalId'] || changes['refresh']) { this.reload(); }
  }
  reload(): void { this.reload$.next(); }
  methodLabel(value: CashPaymentMethod): string { return this.methods.find(method => method.value === value)?.label || value; }
  clearFilters(): void { this.filters.reset(); }
  page(event: PageEvent): void { this.pageIndex = event.pageIndex; this.pageSize = event.pageSize; this.reload(); }
  ngOnDestroy(): void { this.destroy$.next(); this.destroy$.complete(); }
}
