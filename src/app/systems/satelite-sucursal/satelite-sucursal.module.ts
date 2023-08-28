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
import { NgSelectModule } from '@ng-select/ng-select';
import { AutoCompleteModule } from 'primeng/autocomplete';
import { MatPaginatorIntl } from '@angular/material/paginator';
@NgModule({
  imports: [
    CommonModule,
    SateliteSucursalRoutingModule,
    AngularMaterialModule,
    FormsModule,
    ReactiveFormsModule,
    AutoCompleteModule
  ],
  declarations: [SateliteComponent],
  exports:[],
  providers:[HttpClientModule,AuthService,sateliteService, oficinasService, sateliteService]
})
export class SateliteSucursalModule { }
