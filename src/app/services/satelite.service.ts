import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { sucursales_satelite } from '../interfaces/sucursales_satelite';

import { AppsettingsComponent } from '../app-settings/appsettings.component'



@Injectable()
export class sateliteService {

  constructor(private appsettings: AppsettingsComponent, private http: HttpClient, private router: Router) { }

  getSucursalSatelite(oficina: number):Observable<any>{
    return this.http.get<sucursales_satelite[]>(this.appsettings.API_ENDPOINT + `oficina/findAgenciaByIdOficina/${oficina}`);
  }

  getAllSatelite():Observable<any>{
    console.log(this.appsettings.API_ENDPOINT + `planeacion/logistica/sucursal/satelite/getAll`);
    return this.http.get<sucursales_satelite[]>(this.appsettings.API_ENDPOINT + `planeacion/logistica/sucursal/satelite/getAll`);
  }

  setSatelite(data:any){
    return this.http.post(this.appsettings.API_ENDPOINT + `talones/correctComplementoCP/`, data)
    .pipe(
      catchError(e => {
        if (e.error.message) {
          console.error(e.error.message);
        }
        return throwError(e);
      })
    );
  }

  updateSatelite(){

  }


}
