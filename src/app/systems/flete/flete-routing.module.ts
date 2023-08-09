import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PrincipalPlaneacionComponent } from './principal-planeacion/principal-planeacion.component';
import { ConsultaCorteComponent } from './consulta-corte/consulta-corte.component';
import { FleteOptimoComponent } from './flete-optimo/flete-optimo.component';
import { AuthGuard } from 'src/app/authentication/login/guards/auth.guard';
import { RoleGuard } from 'src/app/authentication/login/guards/role.guard';
import { DetallesCorteComponent } from './detalles-corte/detalles-corte.component';

const routes: Routes = [];
export const fletesRoutes: Routes = [
      {
        path: 'fleteOptimo',
        component: FleteOptimoComponent,
        canActivate: [AuthGuard,RoleGuard],
        data: {
          sistema: 14,
          modulo: 80
        }
      },
      {
        path: 'principalPlaneacion',
        component: PrincipalPlaneacionComponent,
        canActivate: [AuthGuard,RoleGuard],
        data: {
          sistema: 14,
          modulo: 78
        }
      },
      {
        path: 'consultaCorte/:fechaInicio/:fechaFin/:oficina',
        component: ConsultaCorteComponent,
        canActivate: [AuthGuard,RoleGuard],
        data: {
          sistema: 14,
          modulo: 79
        }
      },
      {
        path: 'DetallesCorte/:fechaInicio/:fechaFin/:oficina/:idCorte',
        component: DetallesCorteComponent,
        canActivate: [AuthGuard,RoleGuard],
        data: {
          sistema: 14,
          modulo: 79
        }
      }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FleteRoutingModule { }
