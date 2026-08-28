import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';

import { MaterialModule } from 'src/app/shared/material.module';
import { ModalProductComponentComponent } from '../modal-product.component/modal-product.component.component';
import { ModalProductExcelComponent } from '../modal-product-excel/modal-product-excel.component';
import { ModalPinComponent } from './modal-pin.component';

describe('ModalPinComponent', () => {
  let component: ModalPinComponent;
  let fixture: ComponentFixture<ModalPinComponent>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<ModalPinComponent>>;
  let dialog: jasmine.SpyObj<MatDialog>;

  beforeEach(async () => {
    dialogRef = jasmine.createSpyObj<MatDialogRef<ModalPinComponent>>(
      'MatDialogRef', ['close']
    );
    dialog = jasmine.createSpyObj<MatDialog>('MatDialog', ['open']);

    await TestBed.configureTestingModule({
      declarations: [ModalPinComponent],
      imports: [MaterialModule, FormsModule, NoopAnimationsModule],
      providers: [
        { provide: MatDialogRef, useValue: dialogRef },
        { provide: MatDialog, useValue: dialog },
        { provide: MAT_DIALOG_DATA, useValue: { info: 'verify' } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ModalPinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should confirm PIN 1901 from the password input without opening a product dialog', async () => {
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.value = '1901';
    input.dispatchEvent(new Event('input'));
    fixture.detectChanges();
    await fixture.whenStable();

    const confirmButton: HTMLButtonElement =
      fixture.nativeElement.querySelector('.actions button:last-child');
    expect(confirmButton.disabled).toBeFalse();
    confirmButton.click();

    expect(dialogRef.close).toHaveBeenCalledOnceWith(true);
    expect(dialog.open).not.toHaveBeenCalled();
  });

  it('should also accept PIN 1901 when Enter is pressed', () => {
    component.pin = '1901';
    fixture.detectChanges();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('input');
    input.dispatchEvent(new KeyboardEvent('keyup', { key: 'Enter' }));

    expect(dialogRef.close).toHaveBeenCalledOnceWith(true);
  });

  ['', '190', '19012', 'abcd', '0000'].forEach(pin => {
    it(`should reject an invalid PIN: "${pin}"`, () => {
      spyOn(window, 'alert');
      component.pin = pin;

      component.onConfirm();

      expect(dialogRef.close).not.toHaveBeenCalled();
      expect(dialog.open).not.toHaveBeenCalled();
      expect(component.pin).toBe('');
      expect(window.alert).toHaveBeenCalledWith('PIN incorrecto. Inténtalo de nuevo.');
    });
  });

  it('should close without authorization when cancelled', () => {
    const cancelButton: HTMLButtonElement =
      fixture.nativeElement.querySelector('.actions button:first-child');

    cancelButton.click();

    expect(dialogRef.close).toHaveBeenCalledOnceWith('');
  });

  [
    {
      info: 'create',
      product: undefined,
      target: ModalProductComponentComponent,
      data: { customer: '', operation: 'create' }
    },
    {
      info: 'update',
      product: { id: 7 },
      target: ModalProductComponentComponent,
      data: { product: { id: 7 }, operation: 'update' }
    },
    {
      info: 'excel',
      product: undefined,
      target: ModalProductExcelComponent,
      data: { operation: 'excel' }
    }
  ].forEach(({ info, product, target, data }) => {
    it(`should preserve the existing product "${info}" flow`, () => {
      const productDialogRef = jasmine.createSpyObj<MatDialogRef<unknown>>(
        'ProductDialogRef', ['afterClosed']
      );
      productDialogRef.afterClosed.and.returnValue(of(true));
      dialog.open.and.returnValue(productDialogRef);
      component.data = { info, product };
      component.pin = '1901';

      component.onConfirm();

      expect(dialog.open).toHaveBeenCalledWith(target, { data });
      expect(dialogRef.close).toHaveBeenCalledOnceWith(true);
    });
  });
});
