import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSelectHarness } from '@angular/material/select/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { DataService } from '../../services/data.service';
import { MaterialModule } from '../../shared/material.module';
import { ModalProductComponentComponent } from './modal-product.component.component';

describe('ModalProductComponentComponent', () => {
  let component: ModalProductComponentComponent;
  let fixture: ComponentFixture<ModalProductComponentComponent>;
  let service: jasmine.SpyObj<DataService>;
  let data: { operation: string; product?: any };

  beforeEach(async () => {
    localStorage.setItem('local', '1');
    data = { operation: 'update', product: {
      id: 'papa', name: 'PAPA SIERRA CERES', measure: 'LT', description: '',
      category: 'Fertilizantes', priceBuy: 120, priceSale: 158, stock: 0,
      creationDate: new Date(2026, 10, 5), expirationDate: null
    } };
    service = jasmine.createSpyObj('DataService', ['updateProductById', 'saveProduct']);
    service.updateProductById.and.returnValue(of({ success: true }));
    service.saveProduct.and.returnValue(of({ success: true }));
    await TestBed.configureTestingModule({
      declarations: [ModalProductComponentComponent],
      imports: [ReactiveFormsModule, MaterialModule, NoopAnimationsModule],
      providers: [
        { provide: DataService, useValue: service },
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: jasmine.createSpyObj('MatDialogRef', ['close']) }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(ModalProductComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });
  afterEach(() => localStorage.removeItem('local'));

  it('sends 50 KG when the user selects the displayed 50 KG option', async () => {
    const select = await TestbedHarnessEnvironment.loader(fixture)
      .getHarness(MatSelectHarness.with({ selector: '[formControlName="measure"]' }));
    await select.open();
    await select.clickOptions({ text: '50 KG' });
    expect(await select.getValueText()).toBe('50 KG');
    component.onUpdate();
    expect(service.updateProductById).toHaveBeenCalledTimes(1);
    expect(service.updateProductById.calls.mostRecent().args[1].unidadDeMedida).toBe('50 KG');
  });

  ['50KG', '50 KILOGRAMOS', '50 kg'].forEach(measure => {
    it(`preselects 50 KG when editing an existing ${measure} product`, async () => {
      data.product.measure = measure;
      component.createForm();
      fixture.detectChanges();
      const select = await TestbedHarnessEnvironment.loader(fixture)
        .getHarness(MatSelectHarness.with({ selector: '[formControlName="measure"]' }));
      expect(await select.getValueText()).toBe('50 KG');
      component.onUpdate();
      expect(service.updateProductById.calls.mostRecent().args[1].unidadDeMedida).toBe('50 KG');
    });
  });

  it('keeps a current measure that is not among the original select options', async () => {
    data.product.measure = '200 GRAMOS';
    component.createForm();
    fixture.detectChanges();
    const select = await TestbedHarnessEnvironment.loader(fixture)
      .getHarness(MatSelectHarness.with({ selector: '[formControlName="measure"]' }));
    expect(await select.getValueText()).toBe('200 GR');
    component.onUpdate();
    expect(service.updateProductById.calls.mostRecent().args[1].unidadDeMedida).toBe('200 GR');
  });

  it('uses the same abbreviated measure for a new product', () => {
    component.productForm.patchValue({ measure: '250 ML' });
    component.onCreate();
    expect(service.saveProduct.calls.mostRecent().args[0].unidadDeMedida).toBe('250 ML');
  });
});
