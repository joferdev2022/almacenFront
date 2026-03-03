import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ModalSellerComponent } from '../modal-seller/modal-seller.component';

@Component({
  selector: 'app-modal-pin-seller',
  templateUrl: './modal-pin-seller.component.html',
  styleUrls: ['./modal-pin-seller.component.scss']
})
export class ModalPinSellerComponent {

  pin: string = '';
  correctPin: string = '2103';

  constructor(
                  public dialogRef: MatDialogRef<ModalPinSellerComponent>,
                  @Inject(MAT_DIALOG_DATA) public data: any,
                  private dialog: MatDialog
  ) { }

  onConfirm(): void {
      if (this.pin === this.correctPin) {
        // this.dialogRef.close(true); // Pin is correct
        let dialogRefSeller;
        if (this.data.info === 'create') {
  
          dialogRefSeller = this.dialog.open(ModalSellerComponent, {
            data: { customer: '', operation: "create" }
          });
        } else if (this.data.info === 'update') {
          dialogRefSeller = this.dialog.open(ModalSellerComponent, {
            data: { seller: this.data.seller, operation: "update" }
          });
        }
        if (dialogRefSeller) {
        dialogRefSeller.afterClosed().subscribe(result => {
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
