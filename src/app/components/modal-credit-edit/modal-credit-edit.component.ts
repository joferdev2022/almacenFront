import { Component, Inject, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DataService } from 'src/app/services/data.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-modal-credit-edit',
  templateUrl: './modal-credit-edit.component.html',
  styleUrls: ['./modal-credit-edit.component.scss']
})
export class ModalCreditEditComponent implements OnInit {

  public creditSaleForm!: FormGroup;
  local!: any;
  constructor(public dialogRef: MatDialogRef<ModalCreditEditComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private fb: FormBuilder,
              private dataService: DataService,
              public dialog: MatDialog) {
          
        this.local = JSON.parse(localStorage.getItem('local')!) ? JSON.parse(localStorage.getItem('local')!) : '';  
        console.log(data);
        

              }

  ngOnInit(): void {

    this.createForm();
    this.onChanges();

  }

  
  createForm() {
      this.creditSaleForm = this.fb.group({
        // tel: new FormControl()
        amountPayment: ['' , Validators.required ],
        totalPrice: [{ value: this.data.saleCredit ? `S/.${this.data.saleCredit.totalPrice}` : '', disabled: true }],
        local: [ this.local ],
        // subscriptions: [ this.data.customer ? this.data.customer.subscriptions : '', Validators.required ],
      });
      // console.log(this.data.product);
      
  }

  onChanges(): void {
    this.creditSaleForm.get('amountPayment')!.valueChanges.subscribe(val => {
      const totalPrice = this.calculateTotalPrice(val);
      this.creditSaleForm.get('totalPrice')!.setValue(`S/.${totalPrice}`, { emitEvent: false });
    });
  }


  calculateTotalPrice(amountPayment: number): number {
    // Aquí puedes agregar la lógica para calcular el nuevo totalPrice
    // Por ejemplo, restar el amountPayment del totalPrice original
    const originalTotalPrice = this.data.saleCredit ? this.data.saleCredit.totalPrice : 0;
    return originalTotalPrice - amountPayment;
  }

  amountPaymentValidator(control: AbstractControl): ValidationErrors | null {
    const amountPayment = control.value;
    const originalTotalPrice = this.data.saleCredit ? this.data.saleCredit.totalPrice : 0;
    if (amountPayment > originalTotalPrice) {
      return { amountExceedsDebt: true };
    }
    return null;
  }

  onUpdateCredit() {

    const finalAmountPaymentValue = this.data.saleCredit.totalPrice - this.creditSaleForm.value.amountPayment
    if (this.creditSaleForm.value.amountPayment===this.data.saleCredit.totalPrice) {
      this.dataService.updatStateSaleById(this.data.saleCredit.id, 'cancelado').subscribe({
        next: (res) => {
          console.log(res);
          this.dialogRef.close();
            Swal.fire({
              title: "Hecho!",
              text: "El estado de esta venta ha sido cambiado.",
              icon: "success"
            })
        }
      });
      return;
    }

    this.dataService.updatePaymentSaleById(this.data.saleCredit.id, finalAmountPaymentValue).subscribe({
      next: (res) => {
        console.log(res);
        this.dialogRef.close();
        Swal.fire({
          title: "Hecho!",
          text: "La venta a crédito ha sido actualizada.",
          icon: "success"
        })
      }
    });
  }

}
