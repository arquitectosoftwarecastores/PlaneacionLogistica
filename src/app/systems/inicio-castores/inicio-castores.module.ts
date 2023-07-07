import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { inicioCastores } from './inicio-castores-routing.module';
import { RouterModule } from '@angular/router';


@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    RouterModule.forChild(inicioCastores)
  ]
})
export class InicioCastoresModule { }
