import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MaterialModule } from 'src/app/shared/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { ProvidersComponent } from './providers.component';
import { ProvidersRoutingModule } from './providers-routing.module';



@NgModule({
  declarations: [
    ProvidersComponent
  ],
  exports: [
    ProvidersComponent
  ],
  imports: [
    CommonModule,
    ProvidersRoutingModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    MatNativeDateModule
  ]
})
export class ProvidersModule { }
