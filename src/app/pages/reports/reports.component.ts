import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MatPaginatorIntl, PageEvent } from '@angular/material/paginator';
import { EMPTY, Subject, catchError, finalize, switchMap, takeUntil } from 'rxjs';
import { DataService } from '../../services/data.service';
import { ReportChartDatum, SalesReport, SalesReportFilters } from '../../models/internal/report.model';
import { expenseDateValidator } from '../../shared/expense.utils';
import { defaultReportFilters, reportDownloadError, reportError, reportMonthLabel, reportRangeValidator } from '../../shared/report.utils';

export function reportPaginator(): MatPaginatorIntl {
  const paginator = new MatPaginatorIntl();
  paginator.itemsPerPageLabel = 'Filas por página';
  paginator.nextPageLabel = 'Página siguiente';
  paginator.previousPageLabel = 'Página anterior';
  paginator.firstPageLabel = 'Primera página';
  paginator.lastPageLabel = 'Última página';
  paginator.getRangeLabel = (page, size, length) => length ? `${page * size + 1}–${Math.min((page + 1) * size, length)} de ${length}` : '0 de 0';
  return paginator;
}

@Component({
  selector: 'app-reports', templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss', './reports-table.scss'],
  providers: [{ provide: MatPaginatorIntl, useFactory: reportPaginator }]
})
export class ReportsComponent implements OnInit, OnDestroy {
  private readonly defaults = defaultReportFilters();
  readonly filters = new FormGroup({
    fecha_desde: new FormControl(this.defaults.fecha_desde, { nonNullable: true, validators: [Validators.required, expenseDateValidator] }),
    fecha_hasta: new FormControl(this.defaults.fecha_hasta, { nonNullable: true, validators: [Validators.required, expenseDateValidator] }),
    producto: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(120)] }),
    categoria: new FormControl('', { nonNullable: true }),
    ventas: new FormControl<SalesReportFilters['ventas']>(this.defaults.ventas, { nonNullable: true })
  }, { validators: reportRangeValidator });
  report: SalesReport | null = null;
  categories: string[] = [];
  salesChart: ReportChartDatum[] = [];
  unitsChart: ReportChartDatum[] = [];
  rankingMetric: 'cantidad' | 'importe' = 'cantidad';
  loading = false;
  exporting = false;
  error = '';
  downloadError = '';
  pageIndex = 0;
  pageSize = 25;
  readonly monthLabel = reportMonthLabel;
  private readonly requests$ = new Subject<{ filters: SalesReportFilters; page: number; size: number }>();
  private readonly destroy$ = new Subject<void>();
  private destroyed = false;

  constructor(private readonly data: DataService) {}

  ngOnInit(): void {
    this.requests$.pipe(switchMap(request => {
      this.loading = true;
      this.error = '';
      this.downloadError = '';
      return this.data.loadSalesReport(request.filters, request.page, request.size).pipe(
        catchError((error: HttpErrorResponse) => {
          this.report = null;
          this.error = reportError(error);
          return EMPTY;
        }), finalize(() => this.loading = false));
    }), takeUntil(this.destroy$)).subscribe(response => {
      this.report = response.data;
      this.categories = response.data.categorias;
      this.pageIndex = response.data.page - 1;
      this.pageSize = response.data.xpage;
      this.salesChart = response.data.mensual.map(row => ({ label: this.monthLabel(row.mes), value: row.importeVendido }));
      this.unitsChart = response.data.mensual.map(row => ({ label: this.monthLabel(row.mes), value: row.cantidad }));
    });
    this.applyFilters();
  }

  get pendingFilters(): boolean {
    if (!this.report) { return false; }
    const draft = this.filterValues();
    return (Object.keys(draft) as (keyof SalesReportFilters)[]).some(key => draft[key] !== this.report!.filtros[key]);
  }

  get rankingData(): ReportChartDatum[] {
    const rows = this.rankingMetric === 'cantidad' ? this.report?.topCantidad : this.report?.topImporte;
    return (rows || []).map(row => ({ label: row.producto,
      detail: row.productoId ? `ID: ${row.productoId}` : 'Sin ID histórico',
      value: this.rankingMetric === 'cantidad' ? row.cantidad : row.importeVendido }));
  }

  get canDownload(): boolean {
    return !!this.report && !this.loading && !this.exporting && !this.pendingFilters && this.filters.valid;
  }

  private filterValues(): SalesReportFilters {
    const values = this.filters.getRawValue();
    return { ...values, producto: values.producto.trim() };
  }

  applyFilters(): void {
    this.filters.markAllAsTouched();
    if (this.filters.invalid || this.exporting) { return; }
    this.pageIndex = 0;
    this.requests$.next({ filters: this.filterValues(), page: 1, size: this.pageSize });
  }

  resetFilters(): void {
    if (this.exporting) { return; }
    this.filters.reset(defaultReportFilters());
    this.applyFilters();
  }

  changePage(event: PageEvent): void {
    if (!this.report || this.loading || this.exporting || this.pendingFilters) { return; }
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.requests$.next({ filters: { ...this.report.filtros }, page: event.pageIndex + 1, size: event.pageSize });
  }

  download(): void {
    if (!this.canDownload || !this.report) { return; }
    const filters = { ...this.report.filtros };
    const filename = `ventas_local_${this.report.local}_${filters.fecha_desde}_${filters.fecha_hasta}.xlsx`;
    this.exporting = true;
    this.downloadError = '';
    this.data.downloadSalesReport(filters).pipe(takeUntil(this.destroy$), finalize(() => this.exporting = false)).subscribe({
      next: blob => {
        const url = URL.createObjectURL(blob);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = filename;
        document.body.appendChild(anchor);
        try { anchor.click(); }
        finally { anchor.remove(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
      },
      error: async (error: HttpErrorResponse) => {
        const message = await reportDownloadError(error);
        if (!this.destroyed) { this.downloadError = message; }
      }
    });
  }

  ngOnDestroy(): void {
    this.destroyed = true;
    this.destroy$.next();
    this.destroy$.complete();
    this.requests$.complete();
  }
}
