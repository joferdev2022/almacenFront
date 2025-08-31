import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialModule } from 'src/app/shared/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { VendedoresComponent } from './vendedores.component';
import { VendedoresRoutingModule } from './vendedores-routing.module';



@NgModule({
  declarations: [
    VendedoresComponent
  ],
  exports: [
    VendedoresComponent
  ],
  imports: [
    CommonModule,
    VendedoresRoutingModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    MatNativeDateModule
  ]
})
export class VendedoresModule { }
