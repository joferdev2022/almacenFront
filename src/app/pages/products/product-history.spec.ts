import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { DataService } from 'src/app/services/data.service';
import { MaterialModule } from 'src/app/shared/material.module';
import { ProductHistoryPinComponent } from 'src/app/components/product-history-pin/product-history-pin.component';
import { ProductHistoryComponent } from 'src/app/components/product-history/product-history.component';
import { ProductModel } from 'src/app/models/internal/product.model';
import { ProductsComponent } from './products.component';

describe('ProductsComponent history flow', () => {
  let fixture: ComponentFixture<ProductsComponent>;
  let dialog: jasmine.SpyObj<MatDialog>;
  let service: jasmine.SpyObj<DataService>;
  const product = Object.assign(new ProductModel(), { id: 'product', name: 'Arroz', stock: 8 });
  beforeEach(async () => {
    service = jasmine.createSpyObj('DataService', ['loadProducts']);
    service.loadProducts.and.returnValue(of({ data: [product], total: 1, page: 1, xpage: 10 } as any));
    dialog = jasmine.createSpyObj('MatDialog', ['open']);
    await TestBed.configureTestingModule({ declarations: [ProductsComponent],
      imports: [MaterialModule, NoopAnimationsModule],
      providers: [{ provide: DataService, useValue: service }, { provide: MatDialog, useValue: dialog }]
    }).compileComponents();
    fixture = TestBed.createComponent(ProductsComponent); fixture.detectChanges();
  });

  it('places an accessible options button next to the name', () => {
    const cell = fixture.nativeElement.querySelector('.product-name-cell');
    expect(cell.textContent).toContain('Arroz');
    expect(cell.querySelector('button').getAttribute('aria-label')).toBe('Opciones de Arroz');
    expect(cell.querySelector('img')).toBeNull();
  });

  it('opens the panel after PIN success and preserves the table filter', () => {
    const history = { producto: {}, eventos: [], total: 0 };
    dialog.open.and.returnValue({ afterClosed: () => of(history) } as any);
    fixture.componentInstance.dataSource.filter = 'arroz'; fixture.componentInstance.openProductHistory(product);
    expect(dialog.open.calls.argsFor(0)[0]).toBe(ProductHistoryPinComponent);
    expect(dialog.open.calls.argsFor(0)[1]?.data).toEqual({ productId: 'product' });
    expect(dialog.open.calls.argsFor(1)[0]).toBe(ProductHistoryComponent);
    expect(dialog.open.calls.argsFor(1)[1]?.position).toEqual({ right: '0', top: '0' });
    expect(fixture.componentInstance.dataSource.filter).toBe('arroz');
    expect(service.loadProducts).toHaveBeenCalledTimes(1);
  });

  it('keeps the panel closed after PIN cancellation', () => {
    dialog.open.and.returnValue({ afterClosed: () => of(undefined) } as any);
    fixture.componentInstance.openProductHistory(product); expect(dialog.open).toHaveBeenCalledTimes(1);
  });
});
