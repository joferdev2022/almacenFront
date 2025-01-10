import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// import { PagesComponent } from './pages.component';
import { LoginComponent } from './login/login.component';

// const routes: Routes = [
//   {
//     path: '',
//     component: LoginComponent,
//     children: [
//       {
//         path: '', redirectTo: 'login', pathMatch: 'full'
//       },
//       {
//         path: 'login',
//         component: LoginComponent
//       },
//       {
//         path: 'register',
//         component: RegisterComponent
//       },
//     ]
//   }
// ];

const routes: Routes = [
  { path: 'login', component: LoginComponent },
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
  ],
  exports: [RouterModule]
})
export class AuthRoutingModule { }
