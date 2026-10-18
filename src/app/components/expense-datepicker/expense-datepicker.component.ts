import { Component, forwardRef, Input, OnDestroy } from '@angular/core';
import { AbstractControl, ControlValueAccessor, FormControl, NG_VALIDATORS, NG_VALUE_ACCESSOR, ReactiveFormsModule, ValidationErrors, Validator } from '@angular/forms';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDatepickerIntl, MatDatepickerModule } from '@angular/material/datepicker';
import { MatIconModule } from '@angular/material/icon';
import { ExpenseDateAdapter, EXPENSE_DATE_FORMATS, expenseDatepickerIntl } from './expense-date.adapter';

@Component({
  selector: 'app-expense-datepicker',
  standalone: true,
  imports: [ReactiveFormsModule, MatDatepickerModule, MatIconModule],
  templateUrl: './expense-datepicker.component.html',
  styleUrls: ['./expense-datepicker.component.scss'],
  providers: [
    { provide: DateAdapter, useFactory: () => new ExpenseDateAdapter('es-PE') },
    { provide: MAT_DATE_FORMATS, useValue: EXPENSE_DATE_FORMATS },
    { provide: MatDatepickerIntl, useFactory: expenseDatepickerIntl },
    { provide: NG_VALUE_ACCESSOR, useExisting: forwardRef(() => ExpenseDatepickerComponent), multi: true },
    { provide: NG_VALIDATORS, useExisting: forwardRef(() => ExpenseDatepickerComponent), multi: true }
  ]
})
export class ExpenseDatepickerComponent implements ControlValueAccessor, Validator, OnDestroy {
  @Input() inputId = '';
  @Input() label = 'Fecha';
  @Input() required = false;
  @Input() describedBy: string | null = null;
  @Input() invalid = false;
  readonly date = new FormControl<Date | null>(null);
  disabled = false;
  private onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};
  private validatorChanged: () => void = () => {};
  private readonly changes = this.date.valueChanges.subscribe(value => {
    const iso = value && !Number.isNaN(value.getTime())
      ? `${String(value.getFullYear()).padStart(4, '0')}-${String(value.getMonth() + 1).padStart(2, '0')}-${String(value.getDate()).padStart(2, '0')}`
      : '';
    this.onChange(iso);
    this.validatorChanged();
  });

  constructor(private adapter: DateAdapter<Date>) {}

  writeValue(value: string | null): void {
    this.date.setValue(this.adapter.parse(value, EXPENSE_DATE_FORMATS.parse.dateInput), { emitEvent: false });
  }

  registerOnChange(fn: (value: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }
  registerOnValidatorChange(fn: () => void): void { this.validatorChanged = fn; }
  validate(_control: AbstractControl): ValidationErrors | null { return this.date.invalid ? { date: true } : null; }

  setDisabledState(disabled: boolean): void {
    this.disabled = disabled;
    if (disabled) { this.date.disable({ emitEvent: false }); }
    else { this.date.enable({ emitEvent: false }); }
  }

  ngOnDestroy(): void { this.changes.unsubscribe(); }
}
