import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalCreditEditComponent } from './modal-credit-edit.component';

describe('ModalCreditEditComponent', () => {
  let component: ModalCreditEditComponent;
  let fixture: ComponentFixture<ModalCreditEditComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModalCreditEditComponent]
    });
    fixture = TestBed.createComponent(ModalCreditEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
