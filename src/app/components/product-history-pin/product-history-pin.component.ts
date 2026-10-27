import { CommonModule } from '@angular/common';
import { Component, DestroyRef, Inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DataService } from 'src/app/services/data.service';
import { ProductHistory } from 'src/app/models/internal/product-history.model';

@Component({
  selector: 'app-product-history-pin',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatFormFieldModule, MatInputModule],
  templateUrl: './product-history-pin.component.html',
  styleUrls: ['./product-history-pin.component.scss']
})
export class ProductHistoryPinComponent {
  pin = '';
  pending = false;
  error = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { productId: string },
    private service: DataService,
    private destroyRef: DestroyRef,
    private dialogRef: MatDialogRef<ProductHistoryPinComponent, ProductHistory>
  ) {}

  confirm(): void {
    if (this.pending || !/^[0-9]{4}$/.test(this.pin)) { return; }
    this.pending = true;
    this.error = '';
    this.service.loadProductHistory(this.data.productId, this.pin)
      .pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: response => { this.pin = ''; this.dialogRef.close(response.data); },
        error: error => {
          this.pin = '';
          this.pending = false;
          this.error = typeof error.error?.detail === 'string' ? error.error.detail :
            'No se pudo consultar el historial. Inténtalo nuevamente.';
        }
      });
  }
}
