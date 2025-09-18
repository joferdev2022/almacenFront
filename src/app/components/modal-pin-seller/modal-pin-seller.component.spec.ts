import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalPinSellerComponent } from './modal-pin-seller.component';

describe('ModalPinSellerComponent', () => {
  let component: ModalPinSellerComponent;
  let fixture: ComponentFixture<ModalPinSellerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModalPinSellerComponent]
    });
    fixture = TestBed.createComponent(ModalPinSellerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
