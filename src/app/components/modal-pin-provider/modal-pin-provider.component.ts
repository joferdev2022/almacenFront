import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ModalProviderComponent } from '../modal-provider/modal-provider.component';

@Component({
  selector: 'app-modal-pin-provider',
  templateUrl: './modal-pin-provider.component.html',
  styleUrls: ['./modal-pin-provider.component.scss']
})
export class ModalPinProviderComponent {


    pin: string = '';
    correctPin: string = '2103';
  
    constructor(
                    public dialogRef: MatDialogRef<ModalPinProviderComponent>,
                    @Inject(MAT_DIALOG_DATA) public data: any,
                    private dialog: MatDialog
    ) { }

    onConfirm(): void {
          if (this.pin === this.correctPin) {
            // this.dialogRef.close(true); // Pin is correct
            let dialogRefProvider;
            if (this.data.info === 'create') {
      
              dialogRefProvider = this.dialog.open(ModalProviderComponent, {
                data: { provider: '', operation: "create" }
              });
            } else if (this.data.info === 'update') {
              dialogRefProvider = this.dialog.open(ModalProviderComponent, {
                data: { provider: this.data.provider, operation: "update" }
              });
            }
            if (dialogRefProvider) {
            dialogRefProvider.afterClosed().subscribe(result => {
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
