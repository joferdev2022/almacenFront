import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalViewProviderComponent } from './modal-view-provider.component';

describe('ModalViewProviderComponent', () => {
  let component: ModalViewProviderComponent;
  let fixture: ComponentFixture<ModalViewProviderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModalViewProviderComponent]
    });
    fixture = TestBed.createComponent(ModalViewProviderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
