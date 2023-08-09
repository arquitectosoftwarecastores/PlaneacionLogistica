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
import { HttpClientModule } from '@angular/common/http';
import { fletesService } from 'src/app/services/flete.service';
import { oficinasService } from 'src/app/services/oficinas.service';
import { sateliteService } from 'src/app/services/satelite.service';
import { consultaCorteService } from 'src/app/services/consultaCorte';
import { DetallesCorteComponent } from './detalles-corte/detalles-corte.component';

@NgModule({
  declarations: [FleteOptimoComponent,PrincipalPlaneacionComponent,ConsultaCorteComponent, DetallesCorteComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(fletesRoutes),
    FleteRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    AngularMaterialModule,
    MultiSelectModule,

  ],
  providers:[HttpClientModule, fletesService,oficinasService, sateliteService,consultaCorteService]
})
export class FleteModule { }
