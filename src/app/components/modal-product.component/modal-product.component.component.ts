import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import {MatDialog, MAT_DIALOG_DATA, MatDialogRef, MatDialogModule} from '@angular/material/dialog';
import { DataService } from '../../services/data.service';


@Component({
  selector: 'app-modal-product.component',
  templateUrl: './modal-product.component.component.html',
  styleUrls: ['./modal-product.component.component.scss']
})
export class ModalProductComponentComponent implements OnInit {
  public productForm!: FormGroup;

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
      // subscriptions: [ this.data.customer ? this.data.customer.subscriptions : '', Validators.required ],
    });
    console.log(this.data.product);
    
  }

  onCreate() {

  }

 

}
