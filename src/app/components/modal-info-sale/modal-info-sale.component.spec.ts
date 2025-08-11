import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalInfoSaleComponent } from './modal-info-sale.component';

describe('ModalInfoSaleComponent', () => {
  let component: ModalInfoSaleComponent;
  let fixture: ComponentFixture<ModalInfoSaleComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModalInfoSaleComponent]
    });
    fixture = TestBed.createComponent(ModalInfoSaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
