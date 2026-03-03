import { Component, Inject} from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ModalProductComponentComponent } from '../modal-product.component/modal-product.component.component';
import { ModalProductExcelComponent } from '../modal-product-excel/modal-product-excel.component';


@Component({
  selector: 'app-modal-pin',
  templateUrl: './modal-pin.component.html',
  styleUrls: ['./modal-pin.component.scss']
})
export class ModalPinComponent {

  pin: string = '';
  correctPin: string = '2103';

  constructor(
              public dialogRef: MatDialogRef<ModalPinComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private dialog: MatDialog) { 
    console.log(data);
  }

  onConfirm(): void {
    if (this.pin === this.correctPin) {
      // this.dialogRef.close(true); // Pin is correct
      let dialogRefProduct;
      if (this.data.info === 'create') {

        dialogRefProduct = this.dialog.open(ModalProductComponentComponent, {
          data: { customer: '', operation: "create" }
        });
      } else if (this.data.info === 'update') {
        dialogRefProduct = this.dialog.open(ModalProductComponentComponent, {
          data: { product: this.data.product, operation: "update" }
        });
      } else if (this.data.info === 'excel') {
        dialogRefProduct = this.dialog.open(ModalProductExcelComponent, {
          data: { operation: "excel" }
        });
      }
      if (dialogRefProduct) {
      dialogRefProduct.afterClosed().subscribe(result => {
        // Cierra el modal-pin y pasa el resultado hacia arriba
        this.dialogRef.close(result);
      });
      }
    } else {
      this.pin = '';
      alert('PIN incorrecto. Inténtalo de nuevo.');
    }
  }

  
}
