import { ChangeDetectorRef, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-modal-info-sale',
  templateUrl: './modal-info-sale.component.html',
  styleUrls: ['./modal-info-sale.component.scss']
})
export class ModalInfoSaleComponent {

  constructor(public dialogRef: MatDialogRef<ModalInfoSaleComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              ){

                  
                  console.log(data);
                  
                }

}
