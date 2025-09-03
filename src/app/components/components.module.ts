import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NavbarComponent } from './navbar/navbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { MaterialModule } from '../shared/material.module';
import { ModalProductComponentComponent } from './modal-product.component/modal-product.component.component';
import { ModalChoiceComponentComponent } from './modal-choice.component/modal-choice.component.component';
import { ModalSaleComponent } from './modal-sale/modal-sale.component';
import { ModalCreditEditComponent } from './modal-credit-edit/modal-credit-edit.component';
import { ModalInfoSaleComponent } from './modal-info-sale/modal-info-sale.component';
import { ModalPinComponent } from './modal-pin/modal-pin.component';



@NgModule({
  declarations: [
    SidebarComponent,
    NavbarComponent,
    ModalProductComponentComponent,
    ModalChoiceComponentComponent,
    ModalSaleComponent,
    ModalCreditEditComponent,
    ModalInfoSaleComponent,
    ModalPinComponent
    
  ],
  exports: [
    SidebarComponent,
    NavbarComponent,
    ModalProductComponentComponent,
    ModalCreditEditComponent,
    ModalInfoSaleComponent,
    ModalPinComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
  ]
})
export class ComponentsModule { }
