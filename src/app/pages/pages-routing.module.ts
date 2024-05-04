import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PagesComponent } from './pages.component';
import { SalesModule } from './sales/sales.module';


const routes: Routes = [
  {
    path: '',
    component: PagesComponent,
    children: [
      {
        path: '', redirectTo: 'inicio', pathMatch: 'full'
      },
      {
        path: 'inicio',
        // component: 
        loadChildren: () => import('./home/home.module').then(m => m.HomeModule)
      },
      {
        path: 'productos',
        // component: 
        loadChildren: () => import('./products/products.module').then(m => m.ProductsModule)
      },
      {
        path: 'ventas',
        // component: 
        loadChildren: () => import('./sales/sales.module').then(m => m.SalesModule)
      },
      
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [RouterModule]
})
export class PagesRoutingModule { }
