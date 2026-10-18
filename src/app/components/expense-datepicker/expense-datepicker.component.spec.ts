import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerInputHarness } from '@angular/material/datepicker/testing';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ExpenseDatepickerComponent } from './expense-datepicker.component';

@Component({ template: '<app-expense-datepicker inputId="test-date" label="Fecha del gasto" [formControl]="value"></app-expense-datepicker>' })
class DateHostComponent {
  readonly value = new FormControl('2026-10-18');
}

describe('ExpenseDatepickerComponent', () => {
  let fixture: ComponentFixture<DateHostComponent>;
  let host: DateHostComponent;
  let input: MatDatepickerInputHarness;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DateHostComponent],
      imports: [ExpenseDatepickerComponent, ReactiveFormsModule, NoopAnimationsModule]
    }).compileComponents();
    fixture = TestBed.createComponent(DateHostComponent);
    host = fixture.componentInstance;
    fixture.detectChanges();
    input = await TestbedHarnessEnvironment.loader(fixture).getHarness(MatDatepickerInputHarness);
  });

  it('displays the saved day in local format and returns an ISO date after selecting from the Spanish calendar', async () => {
    expect(await input.getValue()).toBe('18/10/2026');
    await input.openCalendar();
    const calendar = await input.getCalendar();
    expect((await calendar.getCurrentViewLabel()).toLowerCase()).toContain('octubre');
    expect(document.querySelector('.expense-calendar-panel')).not.toBeNull();
    await calendar.selectCell({ text: '28' });
    expect(host.value.value).toBe('2026-10-28');
    expect(await input.getValue()).toBe('28/10/2026');
    expect(await input.isCalendarOpen()).toBeFalse();
  });

  it('rejects nonexistent dates instead of silently changing the month', async () => {
    await input.setValue('31/02/2026');
    await input.blur();
    expect(host.value.hasError('date')).toBeTrue();
    expect(host.value.touched).toBeTrue();
    await input.setValue('29/02/2024');
    await input.blur();
    expect(host.value.value).toBe('2024-02-29');
    expect(host.value.valid).toBeTrue();
  });

  it('keeps the calendar day when writing dates without a time or timezone', async () => {
    for (const day of ['2026-01-01', '2026-12-31']) {
      host.value.setValue(day);
      fixture.detectChanges();
      await input.openCalendar();
      const calendar = await input.getCalendar();
      await calendar.selectCell({ text: day.endsWith('01') ? '1' : '31' });
      expect(host.value.value).toBe(day);
    }
  });

  it('disables the field and its calendar button while the parent form is disabled', async () => {
    host.value.disable();
    fixture.detectChanges();
    expect(await input.isDisabled()).toBeTrue();
    expect(fixture.nativeElement.querySelector('button').disabled).toBeTrue();
    host.value.enable();
    fixture.detectChanges();
    expect(await input.isDisabled()).toBeFalse();
  });
});
