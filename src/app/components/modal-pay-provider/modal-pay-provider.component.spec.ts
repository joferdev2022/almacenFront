import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalPayProviderComponent } from './modal-pay-provider.component';

describe('ModalPayProviderComponent', () => {
  let component: ModalPayProviderComponent;
  let fixture: ComponentFixture<ModalPayProviderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModalPayProviderComponent]
    });
    fixture = TestBed.createComponent(ModalPayProviderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
