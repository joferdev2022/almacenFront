import { SimpleChange } from '@angular/core';
import { fakeAsync, tick } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { of, Subject } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import { CashMovementsComponent } from './cash-movements.component';

describe('Movimientos de Caja', () => {
  let component: CashMovementsComponent;
  let service: jasmine.SpyObj<DataService>;
  const response = { data: { items: [], total: 0, page: 1, xpage: 10 }, code: 200, message: '' };
  beforeEach(() => {
    service = jasmine.createSpyObj('DataService', ['loadCashMovements']);
    service.loadCashMovements.and.returnValue(of(response));
    component = new CashMovementsComponent(new FormBuilder(), service, new MatPaginatorIntl());
    component.journalId = 'jornada';
    component.ngOnInit();
  });
  afterEach(() => component.ngOnDestroy());
  it('envía filtros y pagina en backend, rechazando fechas invertidas', fakeAsync(() => {
    component.filters.patchValue({ naturaleza: 'EGRESO', tipo: 'GASTO_NO_EFECTIVO', metodo_pago: 'YAPE' });
    tick(251);
    expect(service.loadCashMovements.calls.mostRecent().args).toEqual([
      'jornada', 1, 10, jasmine.objectContaining({
        naturaleza: 'EGRESO', tipo: 'GASTO_NO_EFECTIVO', metodo_pago: 'YAPE'
      })
    ]);
    component.page({ pageIndex: 1, pageSize: 25, length: 50 });
    expect(service.loadCashMovements.calls.mostRecent().args[1]).toBe(2);
    const calls = service.loadCashMovements.calls.count();
    component.filters.patchValue({ fecha_desde: '2026-08-29', fecha_hasta: '2026-08-28' });
    tick(251);
    expect(component.filters.invalid).toBeTrue();
    expect(service.loadCashMovements.calls.count()).toBe(calls);
    component.clearFilters(); tick(251);
    expect(service.loadCashMovements.calls.mostRecent().args[1]).toBe(1);
  }));
  it('abrir un origen no reinicia la página de movimientos', () => {
    component.pageIndex = 2;
    const calls = service.loadCashMovements.calls.count();
    component.ngOnChanges({ sourceBusy: new SimpleChange('', 'movimiento', false) });
    expect(component.pageIndex).toBe(2);
    expect(service.loadCashMovements.calls.count()).toBe(calls);
  });
  it('ignora respuestas antiguas después de cambiar los filtros', fakeAsync(() => {
    const old = new Subject<any>();
    service.loadCashMovements.and.returnValue(old);
    component.reload();
    service.loadCashMovements.and.returnValue(of({ ...response, data: { ...response.data, total: 7 } }));
    component.filters.controls.origen_tipo.setValue('VENTA'); tick(251);
    old.next({ ...response, data: { ...response.data, total: 99 } });
    expect(component.total).toBe(7);
  }));
});
