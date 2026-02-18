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
  local!: any;

  selectedValue!: string;

  category = [
    {value: 'Insecticidas', viewValue: 'Insecticidas'},
    {value: 'Herbicidas', viewValue: 'Herbicidas'},
    {value: 'Fertilizantes', viewValue: 'Fertilizantes'},
    {value: 'Bioestimulantes', viewValue: 'Bioestimulantes'},
    {value: 'Fungicidas', viewValue: 'Fungicidas'},
    {value: 'Abonos Foliares', viewValue: 'Abonos Foliares'},
    {value: 'Fertilizantes solubles', viewValue: 'Fertilizantes solubles'},
    {value: 'Fertilizantes edáficos', viewValue: 'Fertilizantes edáficos'},
  ]

  measure = [
    {value: 'Unidad', viewValue: 'Unidad'},
    {value: 'Caja', viewValue: 'Caja'},
    {value: '100 GRAMOS', viewValue: '100 GR'},
    {value: '500 GRAMOS', viewValue: '500 GR'},
    {value: 'KILOGRAMO', viewValue: 'KG'},
    {value: '10 KILOGRAMOS', viewValue: '10 KG'},
    {value: '25 KILOGRAMOS', viewValue: '25 KG'},
    {value: '50 KILOGRAMOS', viewValue: '50 KG'},
    {value: '125 MILILITROS', viewValue: '125 ML'},
    {value: '250 MILILITROS', viewValue: '250 ML'},
    {value: 'LITRO', viewValue: 'LT'},
    {value: '4 LITROS', viewValue: '4 LT'},
  ]

  constructor(public dialogRef: MatDialogRef<ModalProductComponentComponent>,
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
    this.productForm = this.fb.group({
      // tel: new FormControl()
      nameProduct: [  this.data.product ? this.data.product.name : '' , Validators.required ],
      description: [ this.data.product ? this.data.product.description : '', [ Validators.required] ],
      category: [ this.data.product ? this.data.product.category : '', Validators.required ],
      measure: [ this.data.product ? this.data.product.measure : '', Validators.required ],
      buyPrice: [ this.data.product ? this.data.product.priceBuy : '', Validators.required ],
      salePrice: [ this.data.product ? this.data.product.priceSale : '', Validators.required ],
      Stock: [ this.data.product ? this.data.product.stock : '', Validators.required ],
      provId: [ this.data.product ? this.data.product.proovId : '', Validators.required ],
      startDate: [ this.data.product ? this.data.product.creationDate : '', Validators.required ],
      endDate: [ this.data.product ? this.data.product.expirationDate : '', Validators.required ],
      local: [ this.local ],
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
      this.dataService.updateProductById(this.data.product.id, ProductRequest.createFromObject(this.productForm.value)).subscribe({
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
