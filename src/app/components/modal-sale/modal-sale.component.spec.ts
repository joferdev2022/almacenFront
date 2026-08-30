import { HttpErrorResponse } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of, Subject } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import { MaterialModule } from 'src/app/shared/material.module';
import Swal from 'sweetalert2';
import { ModalSaleComponent } from './modal-sale.component';

describe('ModalSaleComponent', () => {
  let fixture: ComponentFixture<ModalSaleComponent>;
  let component: ModalSaleComponent;
  let service: jasmine.SpyObj<DataService>;
  let save: Subject<any>;
  const product = { id:'producto-1', name:'Producto', category:'General', measure:'Unidad',
    priceSale:10, priceBuy:4, stock:5 };

  beforeEach(async () => {
    save = new Subject();
    service = jasmine.createSpyObj('DataService',
      ['loadProducts', 'loadAllSellers', 'loadExpenseOptions', 'saveSale']);
    service.loadProducts.and.returnValue(of({ data:[product], total:1, page:1, xpage:10 } as any));
    service.loadAllSellers.and.returnValue(of({ data:[], total:0, page:1, xpage:10 } as any));
    service.loadExpenseOptions.and.returnValue(of({ data:{ metodosPago:
      ['EFECTIVO','YAPE','PLIN','TRANSFERENCIA','TARJETA','OTRO'] }, code:200, message:'' } as any));
    service.saveSale.and.returnValue(save);
    await TestBed.configureTestingModule({
      declarations:[ModalSaleComponent],
      imports:[ReactiveFormsModule, MaterialModule, NoopAnimationsModule],
      providers:[
        {provide:DataService,useValue:service},
        {provide:MatDialogRef,useValue:{close:jasmine.createSpy(),disableClose:false}},
        {provide:MAT_DIALOG_DATA,useValue:{operation:'create'}},
        {provide:MatDialog,useValue:{}},
        MatPaginatorIntl
      ]
    }).compileComponents();
    fixture=TestBed.createComponent(ModalSaleComponent);
    component=fixture.componentInstance;
    fixture.detectChanges();
  });

  it('permite dejar el vendedor vacío', () => {
    expect(component.saleForm.controls['nombreVendedor'].value).toBe('');
    expect(component.saleForm.controls['nombreVendedor'].valid).toBeTrue();
    expect(fixture.nativeElement.textContent).toContain('Vendedor (opcional)');
    fixture.nativeElement.querySelector('mat-select').click();
    fixture.detectChanges();
    expect(document.body.textContent).toContain('Sin vendedor');
  });

  it('muestra estado y métodos como radios con iconos, sin Tarjeta', () => {
    expect(component.paymentMethods).toEqual(['EFECTIVO','YAPE','PLIN','TRANSFERENCIA','OTRO']);
    expect(fixture.nativeElement.querySelectorAll('.state-card').length).toBe(2);
    expect(fixture.nativeElement.querySelectorAll('.method-card').length).toBe(5);
    const icons = Array.from(fixture.nativeElement.querySelectorAll('.method-card .payment-icon')) as HTMLImageElement[];
    expect(icons.length).toBe(5);
    expect(icons.map(icon => icon.getAttribute('src'))).toEqual([
      'assets/icons/payment-methods/efectivo.png',
      'assets/icons/payment-methods/yape.png',
      'assets/icons/payment-methods/plin.png',
      'assets/icons/payment-methods/transferencia.png',
      'assets/icons/payment-methods/otro.png'
    ]);
    expect(fixture.nativeElement.querySelector('.state-credit svg')).not.toBeNull();
    expect(fixture.nativeElement.textContent).not.toContain('Tarjeta');
  });

  it('no exige método mientras está a crédito y vuelve a Efectivo si se marca pagada', () => {
    component.saleForm.controls['estado'].setValue('credito');
    expect(component.saleForm.controls['paymentMhetod'].value).toBeNull();
    expect(component.saleForm.controls['paymentMhetod'].valid).toBeTrue();
    component.saleForm.controls['estado'].setValue('cancelado');
    expect(component.saleForm.controls['paymentMhetod'].value).toBe('efectivo');
  });

  it('avisa claramente cuando la Caja está cerrada y conserva el formulario', () => {
    const alert = spyOn(Swal, 'fire').and.returnValue(Promise.resolve({ isConfirmed: true } as any));
    component.addProducto(product);
    component.onCreate();
    save.error(new HttpErrorResponse({ status: 409,
      error: { detail: 'No existe una caja abierta para registrar esta operación en efectivo.' } }));
    fixture.detectChanges();
    expect(component.saving).toBeFalse();
    expect(component.error).toContain('No existe una caja abierta');
    expect(component.saleForm.enabled).toBeTrue();
    expect(component.productos.length).toBe(1);
    expect(alert).toHaveBeenCalledWith(jasmine.objectContaining({
      title: 'Caja cerrada', icon: 'warning', confirmButtonText: 'Entendido'
    }));
  });

  it('envía una venta válida sin vendedor y evita doble envío', () => {
    component.addProducto(product);
    component.onCreate();
    component.onCreate();
    expect(service.saveSale).toHaveBeenCalledTimes(1);
    const request = service.saveSale.calls.mostRecent().args[0];
    expect(request.nombreVendedor).toBe('');
    expect(request.paymentMethod).toBe('efectivo');
    expect(request.precioTotal).toBe(10);
  });
});
