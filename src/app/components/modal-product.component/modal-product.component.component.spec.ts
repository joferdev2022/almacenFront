import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalProductComponentComponent } from './modal-product.component.component';

describe('ModalProductComponentComponent', () => {
  let component: ModalProductComponentComponent;
  let fixture: ComponentFixture<ModalProductComponentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModalProductComponentComponent]
    });
    fixture = TestBed.createComponent(ModalProductComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
