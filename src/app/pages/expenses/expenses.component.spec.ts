import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, Subject, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { DataService } from 'src/app/services/data.service';
import { MaterialModule } from 'src/app/shared/material.module';
import { ExpensesComponent } from './expenses.component';

describe('ExpensesComponent', () => {
  let component: ExpensesComponent;
  let fixture: ComponentFixture<ExpensesComponent>;
  let service: jasmine.SpyObj<DataService>;

  beforeEach(async () => {
    service = jasmine.createSpyObj('DataService', ['loadExpenses', 'loadExpenseOptions']);
    service.loadExpenseOptions.and.returnValue(of({
      code: 200, message: '', data: { categorias: ['Servicios'], estados: ['PAGADO', 'PENDIENTE'],
        metodosPago: ['EFECTIVO', 'TRANSFERENCIA'], tiposComprobante: ['SIN_COMPROBANTE'] }
    }));
    service.loadExpenses.and.returnValue(of({
      data: [], page: 1, xpage: 10, total: 42, code: 200, message: '',
      resumen: { registrados: 370, pagados: 170, pendientes: 200, pagadosEfectivo: 50 }
    }));
    await TestBed.configureTestingModule({
      declarations: [ExpensesComponent],
      imports: [ReactiveFormsModule, MaterialModule, NoopAnimationsModule],
      providers: [{ provide: DataService, useValue: service }]
    }).compileComponents();
    fixture = TestBed.createComponent(ExpensesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders totals from the backend, independently of the current page', () => {
    expect(component.total).toBe(42);
    expect(component.expenses).toEqual([]);
    expect(fixture.nativeElement.textContent).toContain('370.00');
  });

  it('requests the selected page from the backend', () => {
    component.changePage({ pageIndex: 2, pageSize: 25, length: 42 });
    expect(service.loadExpenses.calls.mostRecent().args.slice(0, 2)).toEqual([3, 25]);
  });

  it('sends search, date, state and method filters and resets pagination', fakeAsync(() => {
    component.pageIndex = 4;
    component.filters.patchValue({ search: 'internet', fecha_desde: '2026-08-28',
      fecha_hasta: '2026-08-28', estado: 'PAGADO', metodo_pago: 'TRANSFERENCIA' });
    tick(301);
    expect(component.pageIndex).toBe(0);
    expect(service.loadExpenses.calls.mostRecent().args[2]).toEqual(jasmine.objectContaining({
      search: 'internet', fecha_desde: '2026-08-28', estado: 'PAGADO', metodo_pago: 'TRANSFERENCIA'
    }));
  }));

  it('does not request a reversed date range and clears filters', fakeAsync(() => {
    const count = service.loadExpenses.calls.count();
    component.filters.patchValue({ fecha_desde: '2026-09-01', fecha_hasta: '2026-08-01' });
    tick(301);
    expect(service.loadExpenses.calls.count()).toBe(count);
    expect(component.filters.hasError('range')).toBeTrue();
    component.clearFilters();
    expect(component.filters.valid).toBeTrue();
    expect(component.filters.controls.fecha_desde.value).toBe('');
  }));

  it('cancels stale requests when a new filter request starts', () => {
    const older = new Subject<any>();
    const newer = new Subject<any>();
    service.loadExpenses.and.returnValues(older, newer);
    component.reload();
    component.reload();
    newer.next({ data: [], total: 2, resumen: { registrados: 20 } });
    older.next({ data: [], total: 99, resumen: { registrados: 999 } });
    expect(component.total).toBe(2);
  });
  it('distinguishes an empty list from a search without matches', () => {
    expect(fixture.nativeElement.querySelector('.empty-state h3').textContent).toContain('Todavía no hay gastos');
    component.filters.controls.search.setValue('sin coincidencias');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.empty-state h3').textContent).toContain('No encontramos coincidencias');
    const clear: HTMLButtonElement = fixture.nativeElement.querySelector('.empty-state button');
    clear.click();
    fixture.detectChanges();
    expect(component.hasActiveFilters).toBeFalse();
    expect(component.filters.controls.search.value).toBe('');
    expect(fixture.nativeElement.querySelector('.clear-filters').disabled).toBeTrue();
  });

  it('does not present a failed load as zero spending or an empty collection', () => {
    service.loadExpenses.and.returnValue(throwError(() => new HttpErrorResponse({ status: 0 })));
    component.reload();
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.empty-state h3').textContent).toContain('No se pudieron cargar');
    expect(fixture.nativeElement.querySelector('.summary-grid').textContent).not.toContain('S/. 0.00');
    expect(fixture.nativeElement.querySelector('.empty-state button')).toBeNull();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('No se pudo conectar');
  });

  it('shows the pending payment action only for users with write permissions', () => {
    Object.defineProperty(component, 'canWrite', { value: true, configurable: true });
    component.expenses = [{ id: 'sample', fecha: '2026-08-28', descripcion: 'Internet',
      categoria: 'Servicios', estado: 'PENDIENTE', monto: 50 } as any];
    fixture.detectChanges();
    const open = spyOn(component, 'open');
    fixture.nativeElement.querySelector('[aria-label="Marcar como pagado"]').click();
    expect(open).toHaveBeenCalledWith(component.expenses[0], 'pay');
    Object.defineProperty(component, 'canWrite', { value: false });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[aria-label="Marcar como pagado"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[aria-label="Editar gasto"]')).toBeNull();
    expect(fixture.nativeElement.querySelector('[aria-label="Ver gasto"]')).not.toBeNull();
  });

  it('labels the paginator in Spanish for full, partial and empty pages', () => {
    const paginator = fixture.debugElement.injector.get(MatPaginatorIntl);
    expect(paginator.getRangeLabel(0, 10, 42)).toBe('1–10 de 42');
    expect(paginator.getRangeLabel(4, 10, 42)).toBe('41–42 de 42');
    expect(paginator.getRangeLabel(0, 10, 0)).toBe('0 de 0');
  });

});
