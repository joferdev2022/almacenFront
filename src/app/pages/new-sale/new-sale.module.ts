import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/shared/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { NewSaleComponent } from './new-sale.component';
import { NewSaleRoutingModule } from './new-sale-routing.module';



@NgModule({
  declarations: [
    NewSaleComponent
  ],
  exports: [
    NewSaleComponent
  ],
  imports: [
    CommonModule,
    NewSaleRoutingModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    MatNativeDateModule
  ]
})
export class NewSaleModule { }
