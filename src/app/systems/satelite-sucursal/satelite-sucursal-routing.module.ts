import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SateliteComponent } from './satelite/satelite.component';
import { AuthGuard } from 'src/app/authentication/login/guards/auth.guard';
import { RoleGuard } from 'src/app/authentication/login/guards/role.guard';


export const satilteRoutes: Routes = [
  {
    path: 'sateliteSucursal', component: SateliteComponent, canActivate: [AuthGuard, RoleGuard],
    data: {
      sistema: 14,
      modulo: 90
    }
  },
  { path: '**', redirectTo: 'sateliteSucursal' }
];

@NgModule({
  imports: [RouterModule.forChild(satilteRoutes)],
  exports: [RouterModule]
})
export class SateliteSucursalRoutingModule { }
