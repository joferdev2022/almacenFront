import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { of } from 'rxjs';
import { DataService } from '../../services/data.service';
import { ProductModel } from '../../models/internal/product.model';
import { MaterialModule } from '../../shared/material.module';
import { ProductsComponent } from './products.component';

describe('ProductsComponent table layout', () => {
  let fixture: ComponentFixture<ProductsComponent>;
  let shell: HTMLElement;
  let area: HTMLElement;
  let service: jasmine.SpyObj<DataService>;

  beforeEach(async () => {
    service = jasmine.createSpyObj('DataService', ['loadProducts', 'loadLatestProductImport']);
    const products = Array.from({ length: 244 }, (_, i) => Object.assign(new ProductModel(), {
      id: String(i), name: `Producto ${i + 1}`, description: 'BIOESTIMULANTE', category: 'Fertilizantes',
      measure: '50 KG', priceBuy: 120, priceSale: 158, stock: 12
    }));
    products[200].name = 'YARAMILAINTEGRADORPARACULTIVOSDEALTAPRODUCTIVIDAD';
    products[200].description = 'NITROGENO+FOSFORO+POTASIO+MICROELEMENTOS'.repeat(4);
    products[201].category = 'FERTILIZANTESSOLUBLESPARACULTIVOSESPECIALIZADOS';
    products[243].name = 'YARAMILA INTEGRADOR';
    service.loadProducts.and.returnValue(of({ data: products, total: 244, page: 1, xpage: 244 } as any));
    service.loadLatestProductImport.and.returnValue(of({ data: null }));
    await TestBed.configureTestingModule({
      declarations: [ProductsComponent], imports: [MaterialModule, NoopAnimationsModule],
      providers: [
        { provide: DataService, useValue: service },
        { provide: MatDialog, useValue: jasmine.createSpyObj('MatDialog', ['open']) }
      ]
    }).compileComponents();
    fixture = TestBed.createComponent(ProductsComponent);
    // Include the actual routed-view selectors from the global responsive stylesheet.
    shell = document.createElement('app-pages');
    area = document.createElement('main');
    area.className = 'display-area';
    area.style.width = '1540px';
    const route = document.createElement('app-products');
    shell.appendChild(area);
    area.appendChild(route);
    document.body.appendChild(shell);
    route.appendChild(fixture.nativeElement);
    fixture.detectChanges();
    fixture.componentInstance.paginator.pageSize = 100;
    fixture.componentInstance.dataSource.paginator = fixture.componentInstance.paginator;
    await fixture.whenStable();
    fixture.detectChanges();
  });

  afterEach(() => { fixture.destroy(); shell.remove(); });

  const element = (fixture: ComponentFixture<ProductsComponent>, selector: string): HTMLElement =>
    fixture.nativeElement.querySelector(selector);

  [1200, 1540].forEach(width => {
    it(`keeps the same column widths and fits all actions on pages 1 and 201–244 at ${width}px`, async () => {
      area.style.width = `${width}px`;
      const scroll = element(fixture, '.table-scroll');
      const widths = () => Array.from(fixture.nativeElement.querySelectorAll('th') as NodeListOf<HTMLElement>)
        .map(cell => cell.getBoundingClientRect().width);
      const firstWidths = widths();
      expect(fixture.nativeElement.querySelectorAll('tr.mat-mdc-row').length).toBe(100);
      fixture.componentInstance.paginator.lastPage();
      await fixture.whenStable();
      fixture.detectChanges();
      expect(fixture.nativeElement.querySelectorAll('tr.mat-mdc-row').length).toBe(44);
      expect(scroll.scrollWidth).withContext('long text must not push actions outside the desktop table').toBeLessThanOrEqual(scroll.clientWidth + 1);
      widths().forEach((value, i) => expect(Math.abs(value - firstWidths[i])).toBeLessThanOrEqual(1));
      const buttons = Array.from(fixture.nativeElement.querySelectorAll('td.mat-column-actions button') as NodeListOf<HTMLElement>);
      expect(Math.max(...buttons.map(button => button.getBoundingClientRect().right)))
        .toBeLessThanOrEqual(scroll.getBoundingClientRect().right + 1);
      const description = element(fixture, 'td.mat-column-description');
      expect(description.scrollWidth).toBeLessThanOrEqual(description.clientWidth + 1);
      expect(description.textContent).toContain('NITROGENO+FOSFORO+POTASIO+MICROELEMENTOS');
      fixture.componentInstance.isPurchasePriceVisible = true;
      fixture.detectChanges();
      expect(scroll.scrollWidth).withContext('showing purchase prices must keep the desktop table within its container').toBeLessThanOrEqual(scroll.clientWidth + 1);
    });
  });

  it('keeps horizontal scrolling inside the table on a narrow screen', async () => {
    area.style.width = '360px';
    fixture.componentInstance.paginator.lastPage();
    await fixture.whenStable();
    fixture.detectChanges();
    const scroll = element(fixture, '.table-scroll');
    expect(scroll.scrollWidth).toBeGreaterThan(scroll.clientWidth);
    expect(getComputedStyle(scroll).overflowX).toBe('auto');
    expect(scroll.getBoundingClientRect().width).toBeLessThanOrEqual(area.getBoundingClientRect().width);
  });
});
