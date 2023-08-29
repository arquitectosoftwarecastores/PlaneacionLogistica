import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { AppsettingsComponent } from '../app-settings/appsettings.component'
import { cedis } from '../interfaces/oficina';
import { oficinas } from '../interfaces/oficina';
import { zonasInfluencia } from '../interfaces/zonasInfluencia';



@Injectable()
export class oficinasService {

  constructor(private appsettings: AppsettingsComponent, private http: HttpClient, private router: Router) { }

  getOficinas(){
    return this.http.get<cedis[]>(this.appsettings.API_ENDPOINT + `planeacion/logistica/sucursal/satelite/getOficinasCedis`);
  }

  getOficina(clave:String) {
    return this.http.get<oficinas>(this.appsettings.API_ENDPOINT + `oficina/findOficinaByClave/`+clave);
  }


  getZonasInfluencia(){
    return this.http.get<zonasInfluencia[]>(this.appsettings.API_ENDPOINT + `planeacion/logistica/principal/getZonasInfluencia`);
  }

}
