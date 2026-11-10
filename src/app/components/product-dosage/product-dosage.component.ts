import { CommonModule } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Subject, finalize, takeUntil } from 'rxjs';
import { DataService } from '../../services/data.service';
import { ProductDosage, ProductDosageEntry } from '../../models/internal/product-dosage.model';
import { normalizeProductMeasure } from '../../shared/product-measure.utils';

function requiredText(control: AbstractControl): { required: boolean } | null {
  return typeof control.value === 'string' && control.value.trim() ? null : { required: true };
}

@Component({
  selector: 'app-product-dosage',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, MatIconModule, MatFormFieldModule, MatInputModule],
  templateUrl: './product-dosage.component.html',
  styleUrls: ['./product-dosage.component.scss']
})
export class ProductDosageComponent implements OnInit, OnDestroy {
  record: ProductDosage | null = null;
  loading = false;
  saving = false;
  editing = false;
  loadError = '';
  saveError = '';
  notice = '';
  conflict = false;
  readonly maxEntries = 50;
  readonly entries = new FormArray<FormGroup>([]);
  readonly form = new FormGroup({ dosificaciones: this.entries });
  readonly formatMeasure = normalizeProductMeasure;
  private readonly destroyed = new Subject<void>();

  constructor(@Inject(MAT_DIALOG_DATA) public data: { productId: string },
    public dialogRef: MatDialogRef<ProductDosageComponent>, private fb: FormBuilder,
    private service: DataService) {}

  ngOnInit(): void { this.load(); }

  ngOnDestroy(): void {
    this.destroyed.next();
    this.destroyed.complete();
  }

  load(): void {
    if (this.loading || this.saving) { return; }
    this.loading = true;
    this.editing = false;
    this.loadError = this.saveError = this.notice = '';
    this.conflict = false;
    this.service.loadProductDosage(this.data.productId).pipe(
      takeUntil(this.destroyed), finalize(() => this.loading = false)
    ).subscribe({
      next: response => this.record = response.data,
      error: error => {
        this.record = null;
        this.loadError = typeof error.error?.detail === 'string' ? error.error.detail : 'No se pudo consultar la dosificación. Intenta nuevamente.';
      }
    });
  }

  beginEdit(): void {
    if (!this.record?.puedeEditar || this.loading || this.saving) { return; }
    this.entries.clear();
    this.record.dosificaciones.forEach(entry => this.entries.push(this.entryForm(entry)));
    if (!this.entries.length) { this.entries.push(this.entryForm()); }
    this.form.markAsPristine();
    this.editing = true;
    this.saveError = this.notice = '';
    this.conflict = false;
  }

  addEntry(): void {
    if (!this.editing || !this.record?.puedeEditar || this.saving || this.entries.length >= this.maxEntries) { return; }
    this.entries.push(this.entryForm());
    this.form.markAsDirty();
  }

  removeEntry(index: number): void {
    if (!this.editing || !this.record?.puedeEditar || this.saving) { return; }
    this.entries.removeAt(index);
    this.form.markAsDirty();
  }

  cancelEdit(): void {
    if (this.saving) { return; }
    this.editing = false;
    this.entries.clear();
    this.saveError = '';
    this.conflict = false;
  }

  save(): void {
    if (!this.record?.puedeEditar || !this.editing || this.saving || this.conflict) { return; }
    this.form.markAllAsTouched();
    if (this.form.invalid) { return; }
    const dosificaciones = this.entries.getRawValue().map(entry => Object.fromEntries(
      Object.entries(entry).map(([key, value]) => [key, String(value ?? '').trim()])
    ) as unknown as ProductDosageEntry);
    this.saving = true;
    this.dialogRef.disableClose = true;
    this.saveError = this.notice = '';
    this.service.saveProductDosage(this.data.productId, { version: this.record.version, dosificaciones }).pipe(
      takeUntil(this.destroyed), finalize(() => {
        this.saving = false;
        this.dialogRef.disableClose = false;
      })
    ).subscribe({
      next: response => {
        this.record = response.data;
        this.editing = false;
        this.notice = 'Dosificación guardada correctamente.';
      },
      error: error => {
        const detail = error.error?.detail;
        this.conflict = error.status === 409;
        this.saveError = typeof detail === 'string' ? detail : 'No se pudo guardar la dosificación. Revisa los datos e intenta nuevamente.';
        if (this.conflict) { this.saveError += ' Tu borrador se conserva en este formulario.'; }
        if (error.status === 403 && this.record) { this.record = { ...this.record, puedeEditar: false }; }
      }
    });
  }

  private entryForm(entry?: ProductDosageEntry): FormGroup {
    return this.fb.nonNullable.group({
      cultivo: [entry?.cultivo || '', [requiredText, Validators.maxLength(150)]],
      objetivo: [entry?.objetivo || '', Validators.maxLength(250)],
      dosis: [entry?.dosis || '', [requiredText, Validators.maxLength(250)]],
      baseAplicacion: [entry?.baseAplicacion || '', [requiredText, Validators.maxLength(200)]],
      aplicacion: [entry?.aplicacion || '', Validators.maxLength(500)],
      observaciones: [entry?.observaciones || '', Validators.maxLength(2000)],
      fuente: [entry?.fuente || '', Validators.maxLength(500)]
    });
  }
}
