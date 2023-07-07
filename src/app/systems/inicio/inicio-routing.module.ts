import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InicioCastoresComponent } from '../inicio-castores/inicio-castores/inicio-castores.component';

export const appRoutes: Routes = [
  { path: 'inicio', component: InicioCastoresComponent },
  {
    path: 'flete',
    loadChildren: () => import('../flete/flete.module').then((m) => m.FleteModule),
  },
  {
    path: 'satelite',
    loadChildren: () => import('../satelite-sucursal/satelite-sucursal.module').then((m) => m.SateliteSucursalModule),

  },
  { path: '**', redirectTo: 'inicio' },
];

@NgModule({
  imports: [RouterModule.forChild(appRoutes)],
  exports: [RouterModule]
})
export class InicioRoutingModule { }
