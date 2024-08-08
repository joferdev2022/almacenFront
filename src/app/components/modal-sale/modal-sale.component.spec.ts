import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalSaleComponent } from './modal-sale.component';

describe('ModalSaleComponent', () => {
  let component: ModalSaleComponent;
  let fixture: ComponentFixture<ModalSaleComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModalSaleComponent]
    });
    fixture = TestBed.createComponent(ModalSaleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
