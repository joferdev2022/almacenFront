import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Subject } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import { ProductHistory } from 'src/app/models/internal/product-history.model';
import { ProductHistoryPinComponent } from './product-history-pin.component';

describe('ProductHistoryPinComponent', () => {
  let fixture: ComponentFixture<ProductHistoryPinComponent>;
  let service: jasmine.SpyObj<DataService>;
  let result: Subject<{ data: ProductHistory }>;
  let close: jasmine.Spy;
  const history: ProductHistory = { producto: { id: 'product', nombre: 'Arroz', unidadDeMedida: 'Bolsa', cantidadEnStock: 10 }, eventos: [], total: 0 };

  beforeEach(async () => {
    service = jasmine.createSpyObj('DataService', ['loadProductHistory']);
    result = new Subject(); service.loadProductHistory.and.returnValue(result);
    close = jasmine.createSpy('close');
    await TestBed.configureTestingModule({
      imports: [ProductHistoryPinComponent, NoopAnimationsModule],
      providers: [{ provide: DataService, useValue: service },
        { provide: MAT_DIALOG_DATA, useValue: { productId: 'product' } },
        { provide: MatDialogRef, useValue: { close } }]
    }).compileComponents();
    fixture = TestBed.createComponent(ProductHistoryPinComponent); fixture.detectChanges();
  });

  it('requires four digits and prevents duplicate submissions', () => {
    const component = fixture.componentInstance;
    for (const pin of ['', '123', 'abcd']) { component.pin = pin; component.confirm(); }
    expect(service.loadProductHistory).not.toHaveBeenCalled();
    component.pin = '2468'; component.confirm(); component.confirm();
    expect(service.loadProductHistory).toHaveBeenCalledOnceWith('product', '2468');
    result.next({ data: history });
    expect(component.pin).toBe(''); expect(close).toHaveBeenCalledOnceWith(history);
  });

  it('shows a PIN error inline, clears the PIN and keeps the dialog open', () => {
    fixture.componentInstance.pin = '0000'; fixture.componentInstance.confirm();
    result.error(new HttpErrorResponse({ status: 403, error: { detail: 'PIN incorrecto.' } }));
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('[role="alert"]').textContent).toContain('PIN incorrecto.');
    expect(fixture.componentInstance.pin).toBe('');
    expect(fixture.componentInstance.pending).toBeFalse(); expect(close).not.toHaveBeenCalled();
  });

  it('cancels the subscription when the PIN dialog is closed', () => {
    fixture.componentInstance.pin = '2468'; fixture.componentInstance.confirm();
    fixture.destroy(); result.next({ data: history }); expect(close).not.toHaveBeenCalled();
  });
});
