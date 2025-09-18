import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SellerRequest } from 'src/app/models/request/seller.request';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-modal-seller',
  templateUrl: './modal-seller.component.html',
  styleUrls: ['./modal-seller.component.scss']
})
export class ModalSellerComponent implements OnInit {

  public sellerForm!: FormGroup;
  local!: any;


  constructor(public dialogRef: MatDialogRef<ModalSellerComponent>,
                @Inject(MAT_DIALOG_DATA) public data: any,
                private fb: FormBuilder,
                private dataService: DataService,
                public dialog: MatDialog) {

      this.local = JSON.parse(localStorage.getItem('local')!) ? JSON.parse(localStorage.getItem('local')!) : '';

                }

  
  ngOnInit(): void {
    
    this.createForm();      
  }

  createForm() {
      this.sellerForm = this.fb.group({
        // tel: new FormControl()
        nombreVendedor: [  this.data.seller ? this.data.seller.nombreVendedor : '' , Validators.required ],
        aliasVendedor: [ this.data.seller ? this.data.seller.aliasVendedor : '', [ Validators.required] ],
        local: [ this.local ],
        // subscriptions: [ this.data.customer ? this.data.customer.subscriptions : '', Validators.required ],
      });
      console.log(this.data.seller);
      
    }

  onCreate() {
      if(true) {
        // console.log(this.userForm.value);
  
        // this.newUser = this.userForm.value;
        // this.newUser.idCustomer = "653d2bc24044f178f6d347e0";
        // console.log(this.newUser);
        console.log(this.sellerForm.value);
        
        this.dataService.saveSeller(SellerRequest.createFromObject(this.sellerForm.value)).subscribe({
          next: (res) => {
            console.log(res)
            if (res && res.success) {
              this.dialogRef.close(true);
            } else {
              this.dialogRef.close(false);
            }
            // this.cus.alertService = res.message;
          },
          error: (e) => {
            // this.openConfirmationModal(Default.CONFIRM_ERROR);
            console.log(e);
            this.dialogRef.close(false);
          }
  
        });
        
      } else {
        // this.openConfirmationModal(Default.CONFIRM_ERROR);
      }
      
    }
  
    onUpdate() {
      console.log("vamos a updatear");
      if(true){
        this.dataService.updateSellerById(this.data.seller.id, SellerRequest.createFromObject(this.sellerForm.value)).subscribe({
          next: (res) => {
            console.log(res);
            if (res && res.success) {
              this.dialogRef.close(true);
            } else {
              this.dialogRef.close(false);
            }
          },
          error: (e) => {
            console.log(e);
            this.dialogRef.close(false);
          }
        });
      }
    }
}
