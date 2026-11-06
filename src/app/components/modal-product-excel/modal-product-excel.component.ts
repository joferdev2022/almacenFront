import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { finalize } from 'rxjs';
import { DataService } from '../../services/data.service';
import { ProductExcelPreview, ProductExcelResult } from '../../models/internal/product-excel.model';

@Component({
  selector: 'app-modal-product-excel',
  templateUrl: './modal-product-excel.component.html',
  styleUrls: ['./modal-product-excel.component.scss']
})
export class ModalProductExcelComponent {
  file: File | null = null;
  status = 'Selecciona el Excel del conteo completo del local.';
  dragging = false;
  busy: 'validating' | 'saving' | null = null;
  validation: ProductExcelPreview | null = null;
  local: number;

  constructor(public dialogRef: MatDialogRef<ModalProductExcelComponent, ProductExcelResult>,
    @Inject(MAT_DIALOG_DATA) public data: { operation: string },
    private dataService: DataService) {
    this.local = Number(JSON.parse(localStorage.getItem('local') || 'null'));
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragging = !this.busy;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.dragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging = false;
    const file = event.dataTransfer?.files[0];
    if (file) { this.setFile(file); }
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) { this.setFile(file); }
  }

  setFile(file: File): void {
    if (this.busy) { return; }
    this.file = null;
    this.validation = null;
    if (!/\.xlsx$/i.test(file.name)) {
      this.status = 'Formato inválido. Selecciona un archivo .xlsx.';
      return;
    }
    this.file = file;
    this.status = 'Archivo seleccionado. Valídalo para revisar los cambios antes de importar.';
  }

  onValidate(): void {
    if (!this.file || this.busy) { return; }
    this.validation = null;
    this.start('validating', 'Validando todas las filas…');
    this.dataService.previewProductsExcel(this.file, this.local).pipe(finalize(() => this.finish())).subscribe({
      next: result => {
        this.validation = result;
        this.status = result.valid
          ? 'Validación completada. Revisa los cambios y pulsa Importar.'
          : `${result.errors.length === 1 ? 'Se encontró 1 error' : `Se encontraron ${result.errors.length} errores`}. Revisa los detalles, corrige el archivo o los productos registrados y vuelve a validar. No se guardó ningún cambio.`;
      },
      error: error => this.showError(error)
    });
  }

  onUpload(): void {
    if (!this.file || !this.validation?.valid || this.busy) { return; }
    this.start('saving', 'Actualizando el inventario…');
    this.dataService.uploadProductsExcel(this.file, this.local, this.validation.catalog_version)
      .pipe(finalize(() => this.finish())).subscribe({
        next: result => this.dialogRef.close(result),
        error: error => this.showError(error)
      });
  }

  private start(state: 'validating' | 'saving', status: string): void {
    this.busy = state;
    this.status = status;
    this.dialogRef.disableClose = true;
  }

  private finish(): void {
    this.busy = null;
    this.dialogRef.disableClose = false;
  }

  private showError(error: { error?: { detail?: unknown } }): void {
    const detail = error.error?.detail;
    if (detail && typeof detail === 'object' && 'errors' in detail && Array.isArray(detail.errors)) {
      this.validation = {
        valid: false, errors: detail.errors, preview: [], catalog_version: '',
        total_processed: 0, inserted_count: 0, updated_count: 0, zeroed_count: 0
      };
      this.status = 'Corrige los errores indicados. No se modificó ningún producto.';
    } else {
      this.validation = null;
      this.status = typeof detail === 'string' ? detail : 'No se pudo completar la operación. Revisa el inventario y vuelve a validar el archivo.';
    }
  }
}
