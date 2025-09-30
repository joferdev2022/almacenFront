import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { ProviderRequest } from 'src/app/models/request/provider.request';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-modal-provider',
  templateUrl: './modal-provider.component.html',
  styleUrls: ['./modal-provider.component.scss']
})
export class ModalProviderComponent {

  public providerForm!: FormGroup;
  local!: any;

  constructor(public dialogRef: MatDialogRef<ModalProviderComponent>,
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
        this.providerForm = this.fb.group({
          // tel: new FormControl()
          nombreProvider: [  this.data.provider ? this.data.provider.nombreProvider : '' , Validators.required ],
          numeroProvider: [ this.data.provider ? this.data.provider.numeroProvider : ''],
          deudaInicial: [ this.data.provider ? this.data.provider.deudaInicial : '', [ Validators.required] ],
          estadoProvider: [  'PENDIENTE', [ Validators.required] ],
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
          console.log(this.providerForm.value);
          
          this.dataService.saveProvider(ProviderRequest.createFromObject(this.providerForm.value)).subscribe({
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
      this.dataService.updateProviderById(this.data.provider.id, ProviderRequest.createFromObject(this.providerForm.value)).subscribe({
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
