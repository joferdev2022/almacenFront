import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { ProductHistory } from 'src/app/models/internal/product-history.model';

@Component({
  selector: 'app-product-history',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatIconModule],
  templateUrl: './product-history.component.html',
  styleUrls: ['./product-history.component.scss']
})
export class ProductHistoryComponent {
  readonly actions: Record<string, string> = {
    CREACION: 'Producto creado', EDICION_MANUAL: 'Edición manual', VENTA: 'Venta registrada',
    EDICION_VENTA: 'Venta editada', ANULACION_VENTA: 'Venta anulada', ELIMINACION: 'Producto eliminado'
  };
  readonly labels: Record<string, string> = {
    nombre: 'Nombre', descripcion: 'Descripción', categoria: 'Categoría', precioCompra: 'Precio de compra',
    precioVenta: 'Precio de venta', cantidadEnStock: 'Stock', unidadDeMedida: 'Medida', proveedorId: 'Proveedor',
    fechaDeCaducidad: 'Caducidad', local: 'Local'
  };

  constructor(@Inject(MAT_DIALOG_DATA) public data: ProductHistory) {}

  formatValue(field: string, value: string | number | null): string {
    if (value === null || value === undefined || value === '') { return '—'; }
    if (field === 'precioCompra' || field === 'precioVenta') {
      return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(Number(value));
    }
    if (field === 'fechaDeCaducidad') {
      const day = String(value).match(/^\d{4}-\d{2}-\d{2}/)?.[0];
      return this.formatDate(day ? `${day}T12:00:00-05:00` : String(value), false);
    }
    return String(value);
  }

  formatDate(value: string, withTime = true): string {
    const date = new Date(value);
    if (isNaN(date.getTime())) { return value; }
    return new Intl.DateTimeFormat('es-PE', { timeZone: 'America/Lima', day: '2-digit', month: 'short',
      year: 'numeric', ...(withTime ? { hour: '2-digit', minute: '2-digit' } as const : {}) }).format(date);
  }
}
