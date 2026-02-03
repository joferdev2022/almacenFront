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
import { ModalSellerComponent } from './modal-seller/modal-seller.component';
import { ModalPinSellerComponent } from './modal-pin-seller/modal-pin-seller.component';
import { ModalPinProviderComponent } from './modal-pin-provider/modal-pin-provider.component';
import { ModalProviderComponent } from './modal-provider/modal-provider.component';
import { ModalPayProviderComponent } from './modal-pay-provider/modal-pay-provider.component';
import { ModalViewProviderComponent } from './modal-view-provider/modal-view-provider.component';
import { ModalInfoSellerComponent } from './modal-info-seller/modal-info-seller.component';
import { ModalProductExcelComponent } from './modal-product-excel/modal-product-excel.component';



@NgModule({
  declarations: [
    SidebarComponent,
    NavbarComponent,
    ModalProductComponentComponent,
    ModalChoiceComponentComponent,
    ModalSaleComponent,
    ModalCreditEditComponent,
    ModalInfoSaleComponent,
    ModalPinComponent,
    ModalSellerComponent,
    ModalPinSellerComponent,
    ModalPinProviderComponent,
    ModalProviderComponent,
    ModalPayProviderComponent,
    ModalViewProviderComponent,
    ModalInfoSellerComponent,
    ModalProductExcelComponent
    
  ],
  exports: [
    SidebarComponent,
    NavbarComponent,
    ModalProductComponentComponent,
    ModalCreditEditComponent,
    ModalInfoSaleComponent,
    ModalPinComponent,
    ModalSellerComponent,
    ModalPinSellerComponent,
    ModalPinProviderComponent,
    ModalProviderComponent,
    ModalPayProviderComponent,
    ModalViewProviderComponent,
    ModalInfoSellerComponent,
    ModalProductExcelComponent
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
