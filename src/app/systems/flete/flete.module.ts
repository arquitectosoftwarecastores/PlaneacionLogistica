import { NgModule } from '@angular/core';
import { CommonModule} from '@angular/common';

import { RouterModule } from '@angular/router';
import { FleteRoutingModule, fletesRoutes } from './flete-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FleteOptimoComponent } from './flete-optimo/flete-optimo.component';
import { AngularMaterialModule } from 'src/app/angular-material.module';
import { PrincipalPlaneacionComponent } from './principal-planeacion/principal-planeacion.component';
import { ConsultaCorteComponent } from './consulta-corte/consulta-corte.component';
import { MultiSelectModule } from 'primeng/multiselect';

@NgModule({
  declarations: [FleteOptimoComponent,PrincipalPlaneacionComponent,ConsultaCorteComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(fletesRoutes),
    FleteRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    AngularMaterialModule,
    MultiSelectModule
  ]
})
export class FleteModule { }