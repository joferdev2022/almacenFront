import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalInfoSellerComponent } from './modal-info-seller.component';

describe('ModalInfoSellerComponent', () => {
  let component: ModalInfoSellerComponent;
  let fixture: ComponentFixture<ModalInfoSellerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModalInfoSellerComponent]
    });
    fixture = TestBed.createComponent(ModalInfoSellerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
