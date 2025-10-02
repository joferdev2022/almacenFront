import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-modal-view-provider',
  templateUrl: './modal-view-provider.component.html',
  styleUrls: ['./modal-view-provider.component.scss']
})
export class ModalViewProviderComponent {

  monto_pagado: number = 0;

  constructor(public dialogRef: MatDialogRef<ModalViewProviderComponent>,
                @Inject(MAT_DIALOG_DATA) public data: any,
                ){
  
                    
                    console.log(data);
                    if (data &&data.provider &&Array.isArray(data.provider.pagos))
                      {
                      this.monto_pagado = data.provider.pagos.reduce(
                        (acc: number, pago: any) => acc + (pago.monto || 0), 0
                      );
                    }
                    
                    
                    
                   
                    
                  }

  
}
