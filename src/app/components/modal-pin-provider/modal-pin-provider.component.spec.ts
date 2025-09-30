import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalPinProviderComponent } from './modal-pin-provider.component';

describe('ModalPinProviderComponent', () => {
  let component: ModalPinProviderComponent;
  let fixture: ComponentFixture<ModalPinProviderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModalPinProviderComponent]
    });
    fixture = TestBed.createComponent(ModalPinProviderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
