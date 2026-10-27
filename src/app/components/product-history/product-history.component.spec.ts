import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ProductHistory } from 'src/app/models/internal/product-history.model';
import { ProductHistoryComponent } from './product-history.component';

describe('ProductHistoryComponent', () => {
  let fixture: ComponentFixture<ProductHistoryComponent>;
  let history: ProductHistory;
  beforeEach(async () => {
    history = { producto: { id: 'product', nombre: 'Arroz', unidadDeMedida: 'Bolsa', cantidadEnStock: 8 }, total: 20,
      eventos: [{ id: '1', accion: 'VENTA', fecha: '2026-10-25T20:00:00Z', usuarioNombre: 'Local1',
        ventaId: '0123456789abcdef', cambios: [{ campo: 'cantidadEnStock', antes: 10, despues: 8 }] }] };
    await TestBed.configureTestingModule({ imports: [ProductHistoryComponent, NoopAnimationsModule],
      providers: [{ provide: MAT_DIALOG_DATA, useValue: history }, { provide: MatDialogRef, useValue: { close() {} } }]
    }).compileComponents();
    fixture = TestBed.createComponent(ProductHistoryComponent); fixture.detectChanges();
  });

  it('shows name, operation, actor, values and count with no images or edit fields', () => {
    const text = fixture.nativeElement.textContent;
    for (const value of ['Arroz', 'Venta registrada', 'Local1', '10', '8', 'Mostrando 1 de 20 registros', '89ABCDEF']) {
      expect(text).toContain(value);
    }
    expect(fixture.nativeElement.querySelector('img')).toBeNull();
    expect(fixture.nativeElement.querySelectorAll('button').length).toBe(1);
    expect(fixture.nativeElement.querySelector('input')).toBeNull();
  });

  it('formats dates in Lima and preserves zero and empty values', () => {
    const component = fixture.componentInstance;
    expect(component.formatDate('2026-10-25T02:00:00Z')).toContain('24');
    expect(component.formatValue('cantidadEnStock', 0)).toBe('0');
    expect(component.formatValue('descripcion', null)).toBe('—');
    expect(component.formatValue('precioVenta', 12.5)).toContain('12.50');
    expect(component.formatValue('fechaDeCaducidad', '2026-10-25T00:00:00')).toContain('25');
  });

  it('explains the empty state without inventing past changes', () => {
    history.eventos = []; history.total = 0; fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Aún no hay cambios registrados');
    expect(fixture.nativeElement.querySelector('footer')).toBeNull();
  });
});
