import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalProductExcelComponent } from './modal-product-excel.component';

describe('ModalProductExcelComponent', () => {
  let component: ModalProductExcelComponent;
  let fixture: ComponentFixture<ModalProductExcelComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModalProductExcelComponent]
    });
    fixture = TestBed.createComponent(ModalProductExcelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
