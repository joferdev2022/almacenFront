import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalChoiceComponentComponent } from './modal-choice.component.component';

describe('ModalChoiceComponentComponent', () => {
  let component: ModalChoiceComponentComponent;
  let fixture: ComponentFixture<ModalChoiceComponentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ModalChoiceComponentComponent]
    });
    fixture = TestBed.createComponent(ModalChoiceComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
