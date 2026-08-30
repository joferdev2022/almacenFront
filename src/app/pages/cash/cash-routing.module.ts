import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CashComponent } from './cash.component';

const routes: Routes = [
  { path: '', component: CashComponent, data: { view: 'current' } },
  { path: 'historial', component: CashComponent, data: { view: 'history' } },
  { path: 'jornadas/:id', component: CashComponent, data: { view: 'detail' } }
];
@NgModule({ imports: [RouterModule.forChild(routes)], exports: [RouterModule] })
export class CashRoutingModule {}
