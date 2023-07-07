import { NgModule } from '@angular/core';
import { CommonModule, NgFor } from '@angular/common';
import { SateliteSucursalRoutingModule } from './satelite-sucursal-routing.module';
import { SateliteComponent } from './satelite/satelite.component';
import { AngularMaterialModule } from 'src/app/angular-material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AuthService } from 'src/app/authentication/login/auth.service';
import { sateliteService } from 'src/app/services/satelite.service';
import { oficinasService } from 'src/app/services/oficinas.service';

@NgModule({
  imports: [
    CommonModule,
    SateliteSucursalRoutingModule,
    AngularMaterialModule,
    FormsModule,
    ReactiveFormsModule,

  ],
  declarations: [SateliteComponent],
  exports:[],
  providers:[HttpClientModule,AuthService,sateliteService, oficinasService]
})
export class SateliteSucursalModule { }
