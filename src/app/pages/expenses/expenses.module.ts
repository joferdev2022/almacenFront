import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialModule } from 'src/app/shared/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { ExpensesComponent } from './expenses.component';
import { ExpensesRoutingModule } from './expenses-routing.module';



@NgModule({
  declarations: [
    ExpensesComponent
  ],
  exports: [
    ExpensesComponent
  ],
  imports: [
    CommonModule,
    ExpensesRoutingModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    MatNativeDateModule
  ]
})
export class ExpensesModule { }
