import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse, HttpParams } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { flete_optimo } from '../interfaces/flete';

import { AppsettingsComponent } from '../app-settings/appsettings.component'
import { tipoVenta } from '../interfaces/tipoVenta';
import { ubicacionTalon } from '../interfaces/ubicacionTalon';
import { DatosTalon } from '../interfaces/datosTalon';



@Injectable()
export class fletesService {

  constructor(private appsettings: AppsettingsComponent, private http: HttpClient, private router: Router) { }

  getFletesOptimo(){
    return this.http.get<flete_optimo[]>(this.appsettings.API_ENDPOINT + `planeacion/logistica/flete/optimo/getAll`);
  }
  getTipoVenta():Observable<tipoVenta[]>{
    return this.http.get<tipoVenta[]>(this.appsettings.API_ENDPOINT + `planeacion/logistica/principal/getTipoVenta`);
  }
  getUbicacionTalon():Observable<ubicacionTalon[]>{
    return this.http.get<ubicacionTalon[]>(this.appsettings.API_ENDPOINT + `planeacion/logistica/principal/getUbicacionTalon`);
  }

  getPisoAgenciaSatelite(datoPrincipal:any){
    return this.http.post<DatosTalon[]>(this.appsettings.API_ENDPOINT + `planeacion/logistica/principal/getPisoAgenciaSatelite/`,datoPrincipal);
  }
  getPisoLocal(datoPrincipal:any){
    return this.http.post<DatosTalon[]>(this.appsettings.API_ENDPOINT + `planeacion/logistica/principal/getPisoLocal/`,datoPrincipal);
  }
  getVirtualAgenciaSatelite(datoPrincipal:any){
    return this.http.post<DatosTalon[]>(this.appsettings.API_ENDPOINT + `planeacion/logistica/principal/getVirtualAgenciaSatelite/`,datoPrincipal);
  }


}
