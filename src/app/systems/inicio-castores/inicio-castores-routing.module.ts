import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { InicioCastoresComponent } from './inicio-castores/inicio-castores.component';


export const inicioCastores: Routes = [
  { path: 'logo', component: InicioCastoresComponent },
  { path: '**', redirectTo: '' }
]

@NgModule({
  imports: [RouterModule.forChild(inicioCastores)],
  exports: [RouterModule]
})
export class InicioCastoresRoutingModule { }
