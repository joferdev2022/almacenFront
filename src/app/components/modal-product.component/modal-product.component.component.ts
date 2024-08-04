import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import {MatDialog, MAT_DIALOG_DATA, MatDialogRef, MatDialogModule} from '@angular/material/dialog';
import { DataService } from '../../services/data.service';
import { ProductRequest } from 'src/app/models/request/product.request';


@Component({
  selector: 'app-modal-product.component',
  templateUrl: './modal-product.component.component.html',
  styleUrls: ['./modal-product.component.component.scss']
})
export class ModalProductComponentComponent implements OnInit {
  public productForm!: FormGroup;

  selectedValue!: string;

  category = [
    {value: 'Insecticidas', viewValue: 'Insecticidas'},
    {value: 'Herbicidas', viewValue: 'Herbicidas'},
    {value: 'Fertilizantes', viewValue: 'Fertilizantes'},
    {value: 'Bioestimulantes', viewValue: 'Bioestimulantes'},
  ]

  measure = [
    {value: 'Unidad', viewValue: 'Unidad'},
    {value: 'Caja', viewValue: 'Caja'}
  ]

  constructor(public dialogRef: MatDialogRef<ModalProductComponentComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private fb: FormBuilder,
              private dataService: DataService,
              public dialog: MatDialog) {

              }

  ngOnInit(): void {

    this.createForm();

  }

  createForm() {
    this.productForm = this.fb.group({
      // tel: new FormControl()
      nameProduct: [  this.data.product ? this.data.product.nameProduct : '' , Validators.required ],
      description: [ this.data.product ? this.data.product.description : '', [ Validators.required] ],
      category: [ this.data.product ? this.data.product.category : '', Validators.required ],
      measure: [ this.data.product ? this.data.product.measure : '', Validators.required ],
      buyPrice: [ this.data.product ? this.data.product.buyPrice : '', Validators.required ],
      salePrice: [ this.data.product ? this.data.product.salePrice : '', Validators.required ],
      Stock: [ this.data.product ? this.data.product.Stock : '', Validators.required ],
      provId: [ this.data.product ? this.data.product.provId : '', Validators.required ],
      startDate: [ this.data.product ? this.data.product.startDate : '', Validators.required ],
      endDate: [ this.data.product ? this.data.product.endDate : '', Validators.required ],
      // subscriptions: [ this.data.customer ? this.data.customer.subscriptions : '', Validators.required ],
    });
    console.log(this.data.product);
    
  }

  onCreate() {
    if(true) {
      // console.log(this.userForm.value);

      // this.newUser = this.userForm.value;
      // this.newUser.idCustomer = "653d2bc24044f178f6d347e0";
      // console.log(this.newUser);
      console.log(this.productForm.value);
      
      this.dataService.saveProduct(ProductRequest.createFromObject(this.productForm.value)).subscribe({
        next: (res) => {
          console.log(res)
          // this.cus.alertService = res.message;
        },
        error: (e) => {
          // this.openConfirmationModal(Default.CONFIRM_ERROR);
          console.log(e);
        }

      });
      
    } else {
      // this.openConfirmationModal(Default.CONFIRM_ERROR);
    }
    
  }

 

}
