import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PagesComponent } from './pages.component';
import { SalesModule } from './sales/sales.module';
import { authGuard } from '../guards/auth.guard';


const routes: Routes = [
  {
    path: '',
    component: PagesComponent,
    canActivate: [authGuard],
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
        path: 'graficos',
        // component: 
        loadChildren: () => import('./charts/charts.module').then(m => m.ChartsModule)
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
      {
        path: 'creditos',
        // component: 
        loadChildren: () => import('./credits/credits.module').then(m => m.CreditsModule)
      },
      {
        path: 'gastos',
        // component: 
        loadChildren: () => import('./expenses/expenses.module').then(m => m.ExpensesModule)
      },
      {
        path: 'vendedores',
        // component: 
        loadChildren: () => import('./vendedores/vendedores.module').then(m => m.VendedoresModule)
      },
      {
        path: 'proveedores',
        // component: 
        loadChildren: () => import('./providers/providers.module').then(m => m.ProvidersModule)
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
