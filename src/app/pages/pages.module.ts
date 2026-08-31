import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { A11yModule } from '@angular/cdk/a11y';
import { PagesComponent } from './pages.component';
import { HomeComponent } from './home/home.component';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from '../shared/shared.module';
import { MaterialModule } from '../shared/material.module';
import { PagesRoutingModule } from './pages-routing.module';
import { ComponentsModule } from '../components/components.module';
import { ProvidersComponent } from './providers/providers.component';




@NgModule({
  declarations: [
    PagesComponent,
    
    
      
    
  ],
  imports: [
    CommonModule,
    A11yModule,
    HttpClientModule,
    SharedModule,
    MaterialModule,
    PagesRoutingModule,
    ComponentsModule
  ]
})
export class PagesModule { }
