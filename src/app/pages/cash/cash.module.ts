import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { MaterialModule } from 'src/app/shared/material.module';
import { ComponentsModule } from 'src/app/components/components.module';
import { CashComponent } from './cash.component';
import { CashMovementsComponent } from './cash-movements.component';
import { ModalCashOperationComponent } from 'src/app/components/modal-cash-operation/modal-cash-operation.component';
import { CashRoutingModule } from './cash-routing.module';

@NgModule({
  declarations: [CashComponent, CashMovementsComponent, ModalCashOperationComponent],
  imports: [CommonModule, ReactiveFormsModule, RouterModule, MaterialModule, ComponentsModule, CashRoutingModule]
})
export class CashModule {}
