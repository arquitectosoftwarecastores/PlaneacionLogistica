import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';

export const AuthenticationRoutes: Routes = [
  { path: 'inicioSesion', component: LoginComponent },
  { path: '**', redirectTo: 'inicioSesion' }
];

@NgModule({
  imports: [RouterModule.forChild(AuthenticationRoutes)],
  exports: [RouterModule]
})
export class AuthenticationRoutingModule { }
