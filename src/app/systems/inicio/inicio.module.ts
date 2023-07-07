import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InicioRoutingModule, appRoutes } from './inicio-routing.module';
import { RouterModule } from '@angular/router';
import { AngularMaterialModule } from 'src/app/angular-material.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    InicioRoutingModule,
    RouterModule.forChild(appRoutes),
    AngularMaterialModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  exports: [],
})
export class InicioModule { }
