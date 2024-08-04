import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NavbarComponent } from './navbar/navbar.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { MaterialModule } from '../shared/material.module';
import { ModalProductComponentComponent } from './modal-product.component/modal-product.component.component';
import { ModalChoiceComponentComponent } from './modal-choice.component/modal-choice.component.component';



@NgModule({
  declarations: [
    SidebarComponent,
    NavbarComponent,
    ModalProductComponentComponent,
    ModalChoiceComponentComponent
  ],
  exports: [
    SidebarComponent,
    NavbarComponent,
    ModalProductComponentComponent
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
