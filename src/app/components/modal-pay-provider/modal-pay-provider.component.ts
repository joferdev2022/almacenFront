import { Component, Inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DataService } from 'src/app/services/data.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modal-pay-provider',
  templateUrl: './modal-pay-provider.component.html',
  styleUrls: ['./modal-pay-provider.component.scss']
})
export class ModalPayProviderComponent {

  public payProviderForm!: FormGroup;
  local!: any;
  currentDebt: number = 0;

  constructor(public dialogRef: MatDialogRef<ModalPayProviderComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private fb: FormBuilder,
              private dataService: DataService,
              public dialog: MatDialog) {
            
          this.local = JSON.parse(localStorage.getItem('local')!) ? JSON.parse(localStorage.getItem('local')!) : '';  
          this.currentDebt = this.data.provider?.deudaActual || 0;
          console.log(data);
          
  
                }
  ngOnInit(): void {

    this.createForm();
    this.onChanges();

  }

  createForm() {
        this.payProviderForm = this.fb.group({
          // tel: new FormControl()
          amountPayment: ['' , [Validators.required, this.amountExceedsDebtValidator(this.data.provider?.deudaActual || 0)] ],
          totalPrice: [{ value: this.data.provider ? `S/.${this.data.provider.deudaActual}` : '', disabled: true }],
          local: [ this.local ],
          // subscriptions: [ this.data.customer ? this.data.customer.subscriptions : '', Validators.required ],
        });
        // console.log(this.data.product);
        
    }

  amountExceedsDebtValidator(maxDebt: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const value = Number(control.value);
      if (value > maxDebt) {
        return { amountExceedsDebt: true };
      }
      return null;
    };
  }
  
  onChanges(): void {
    this.payProviderForm.get('amountPayment')!.valueChanges.subscribe(val => {
      const totalPrice = this.calculateTotalPrice(val);
      this.payProviderForm.get('totalPrice')!.setValue(`S/.${totalPrice}`, { emitEvent: false });
      this.currentDebt = totalPrice;
    });
  }

  calculateTotalPrice(amountPayment: number): number {
    // Aquí puedes agregar la lógica para calcular el nuevo totalPrice
    // Por ejemplo, restar el amountPayment del totalPrice original
    const originalTotalPrice = this.data.provider ? this.data.provider.deudaActual : 0;
    return originalTotalPrice - amountPayment;
  }

  amountPaymentValidator(control: AbstractControl): ValidationErrors | null {
      const amountPayment = control.value;
      const originalTotalPrice = this.data.provider ? this.data.provider.deudaActual : 0;
      if (amountPayment > originalTotalPrice) {
        return { amountExceedsDebt: true };
      }
      return null;
    }
  
  onPayProvider() {
  
      console.log("se  va a pagar al proveedor");
      
      const finalAmountPaymentValue = this.data.provider.deudaActual - this.payProviderForm.value.amountPayment
    
      this.dataService.updateProviderDebtById(this.data.provider.id, finalAmountPaymentValue, this.payProviderForm.value.amountPayment).subscribe({
        next: (res) => {
          console.log(res);
          this.dialogRef.close();
          Swal.fire({
            title: "Hecho!",
            text: "La deuda al proveedor ha sido actualizada.",
            icon: "success"
          })
        }
      });
    }

}
