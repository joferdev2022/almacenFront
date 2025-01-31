import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from 'src/app/shared/material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatNativeDateModule } from '@angular/material/core';
import { CreditsComponent } from './credits.component';
import { CreditsRoutingModule } from './credits-routing.module';




@NgModule({
  declarations: [
    CreditsComponent
  ],
  exports: [
    CreditsComponent
  ],
  imports: [
    CommonModule,
    CreditsRoutingModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    MatNativeDateModule
  ]
})
export class CreditsModule { }
