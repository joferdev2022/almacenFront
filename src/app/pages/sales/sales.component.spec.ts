import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { of, Subject } from 'rxjs';

import { ModalPinComponent } from 'src/app/components/modal-pin/modal-pin.component';
import { DataService } from 'src/app/services/data.service';
import { MaterialModule } from 'src/app/shared/material.module';
import { SalesComponent } from './sales.component';

describe('SalesComponent', () => {
  let component: SalesComponent;
  let fixture: ComponentFixture<SalesComponent>;
  let dialog: jasmine.SpyObj<MatDialog>;
  let pinResult: Subject<boolean | string | undefined>;
  let dataService: jasmine.SpyObj<DataService>;

  const profitValue = (): HTMLElement =>
    fixture.nativeElement.querySelector('#net-profit-value');
  const visibilityButton = (): HTMLButtonElement =>
    fixture.nativeElement.querySelector('.net-profit-toggle');

  beforeEach(async () => {
    spyOn(Storage.prototype, 'getItem').and.returnValue(null);
    dataService = jasmine.createSpyObj<DataService>('DataService', [
      'loadSales', 'dayliSalesByLocal'
    ]);
    dataService.loadSales.and.returnValue(of({
      message: '', code: 200, data: [], total: 0, xpage: 10, page: 1
    }));
    dataService.dayliSalesByLocal.and.returnValue(of({
      ganancia_neta: 1234.56,
      ventas_totales: 2500,
      numero_ventas: 3,
      pagos_parciales_hoy: 100
    }));
    pinResult = new Subject<boolean | string | undefined>();
    const pinDialogRef = jasmine.createSpyObj<MatDialogRef<ModalPinComponent, boolean | string>>(
      'MatDialogRef', ['afterClosed']
    );
    pinDialogRef.afterClosed.and.callFake(() => pinResult.asObservable());
    dialog = jasmine.createSpyObj<MatDialog>('MatDialog', ['open']);
    dialog.open.and.returnValue(pinDialogRef);

    await TestBed.configureTestingModule({
      declarations: [SalesComponent],
      imports: [MaterialModule, ReactiveFormsModule, NoopAnimationsModule],
      providers: [
        { provide: DataService, useValue: dataService },
        { provide: MatDialog, useValue: dialog },
        { provide: Router, useValue: {} }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SalesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should hide the loaded net profit by default without hiding other totals', () => {
    expect(profitValue().textContent?.trim()).toBe('S/ ****');
    expect(fixture.nativeElement.textContent).not.toContain('1,234.56');
    expect(fixture.nativeElement.textContent).toContain('2,500.00');
    expect(visibilityButton().getAttribute('aria-label')).toBe('Mostrar ingreso neto');
  });

  it('should request the existing PIN dialog and remain hidden until confirmation', () => {
    visibilityButton().click();
    fixture.detectChanges();

    expect(dialog.open).toHaveBeenCalledWith(ModalPinComponent, {
      data: { info: 'verify' }
    });
    expect(profitValue().textContent?.trim()).toBe('S/ ****');
  });

  it('should show the formatted net profit only after PIN confirmation', () => {
    visibilityButton().click();
    pinResult.next(true);
    pinResult.complete();
    fixture.detectChanges();

    expect(profitValue().textContent?.trim()).toBe('S/ 1,234.56');
    expect(visibilityButton().getAttribute('aria-label')).toBe('Ocultar ingreso neto');
    expect(visibilityButton().querySelector('mat-icon')?.textContent).toBe('visibility_off');
  });

  [false, undefined, ''].forEach(result => {
    it(`should keep net profit hidden when the dialog closes with ${result}`, () => {
      visibilityButton().click();
      pinResult.next(result);
      pinResult.complete();
      fixture.detectChanges();

      expect(profitValue().textContent?.trim()).toBe('S/ ****');
    });
  });

  it('should hide immediately and require a new PIN confirmation to reveal again', () => {
    visibilityButton().click();
    pinResult.next(true);
    pinResult.complete();
    fixture.detectChanges();

    visibilityButton().click();
    fixture.detectChanges();
    expect(profitValue().textContent?.trim()).toBe('S/ ****');
    expect(dialog.open).toHaveBeenCalledTimes(1);

    pinResult = new Subject<boolean | string | undefined>();
    visibilityButton().click();
    fixture.detectChanges();
    expect(dialog.open).toHaveBeenCalledTimes(2);
    expect(profitValue().textContent?.trim()).toBe('S/ ****');

    pinResult.next(true);
    pinResult.complete();
    fixture.detectChanges();
    expect(profitValue().textContent?.trim()).toBe('S/ 1,234.56');
  });

  it('should keep net profit hidden when the daily report is refreshed', () => {
    dataService.dayliSalesByLocal.and.returnValue(of({
      ganancia_neta: 9876.54,
      ventas_totales: 11000,
      numero_ventas: 4,
      pagos_parciales_hoy: 200
    }));

    component.loadSalesReportDayly();
    fixture.detectChanges();

    expect(component.netProfit).toBe(9876.54);
    expect(profitValue().textContent?.trim()).toBe('S/ ****');
    expect(fixture.nativeElement.textContent).not.toContain('9,876.54');
  });
});
