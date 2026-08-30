import { SaleModel } from 'src/app/models/internal/sale.model';
import { FormBuilder } from '@angular/forms';
import { of, Subject } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import { ModalCreditEditComponent } from './modal-credit-edit.component';

describe('Cobro de crédito integrado con Caja', () => {
  let component: ModalCreditEditComponent;
  let service: jasmine.SpyObj<DataService>;
  let payment: Subject<any>;
  beforeEach(() => {
    payment = new Subject();
    service = jasmine.createSpyObj('DataService', ['loadExpenseOptions', 'updatePaymentSaleById']);
    service.loadExpenseOptions.and.returnValue(of({ data: { metodosPago: ['EFECTIVO', 'YAPE'] } as any, code: 200, message: '' }));
    service.updatePaymentSaleById.and.returnValue(payment);
    component = new ModalCreditEditComponent(new FormBuilder(), service, { close: jasmine.createSpy() } as any,
      { saleCredit: { id: 'venta', totalPrice: 200, saldoPendiente: 120 } });
  });
  afterEach(() => component.ngOnDestroy());
  it('exige método y fecha, y no permite cobrar más que la deuda', () => {
    component.form.patchValue({ monto: '50', metodoPago: null });
    component.save(); expect(service.updatePaymentSaleById).not.toHaveBeenCalled();
    component.form.patchValue({ monto: '121', metodoPago: 'EFECTIVO' });
    component.save(); expect(service.updatePaymentSaleById).not.toHaveBeenCalled();
    component.form.patchValue({ monto: '50', fechaPago: '' });
    component.save(); expect(service.updatePaymentSaleById).not.toHaveBeenCalled();
  });
  it('envía también el último cobro con su método y evita doble envío', () => {
    component.form.patchValue({ monto: '120', metodoPago: 'YAPE', fechaPago: '2026-08-28' });
    component.save(); component.save();
    expect(service.updatePaymentSaleById).toHaveBeenCalledOnceWith('venta',
      { monto: 120, metodoPago: 'YAPE', fechaPago: '2026-08-28' }, component.operationId);
  });

  it('muestra los métodos de los cobros reales y conserva el detalle de pagos corregidos', () => {
    const sale = SaleModel.createFromObject({ estado:'cancelado', paymentMethod:'efectivo',
      pagos:[{monto:50,metodoPago:'EFECTIVO',anulado:true},{monto:120,metodoPago:'YAPE'}] });
    expect(sale.paymentSummary).toBe('YAPE');
    expect(sale.pagos.length).toBe(2);
    sale.pagos.push({monto:50,metodoPago:'EFECTIVO',fecha:'2026-08-28'});
    expect(sale.paymentSummary).toBe('YAPE / EFECTIVO');
  });
});
