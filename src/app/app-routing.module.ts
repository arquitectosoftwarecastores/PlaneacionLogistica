import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './authentication/login/guards/auth.guard';
import { InicioComponent } from './systems/inicio/inicio-sidenav/inicio.component';
import { LoginComponent } from './authentication/login/login.component';
import { RoleGuard } from './authentication/login/guards/role.guard';

export const appRoutes:Routes=[
  {
    path: '',
    component: InicioComponent,
    children: [
      {
        path: 'home',
        loadChildren: () => import('./systems/inicio/inicio.module').then((m) => m.InicioModule),
      }
    ],
    canActivate: [AuthGuard]
  },
  {
    path: 'login',
    loadChildren: () => import('./authentication/authentication.module').then((m) => m.AuthenticationModule),
  },
  {
    path: '**',
    redirectTo: 'home'
  }
];


@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
