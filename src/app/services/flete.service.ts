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
import { ruta } from '../interfaces/ruta';
import { CircuitoFleteOptimo } from '../interfaces/circuitos';



@Injectable()
export class fletesService {

  constructor(private appsettings: AppsettingsComponent, private http: HttpClient, private router: Router) { }

  getFletesOptimo(){
    return this.http.get<flete_optimo[]>(this.appsettings.API_ENDPOINT + `planeacion/logistica/flete/optimo/getAll`);
  }
  getByFletesOptimo(idFleteOptimo:number){
    return this.http.get<flete_optimo>(this.appsettings.API_ENDPOINT + `planeacion/logistica/flete/optimo/getById/`+idFleteOptimo);
  }

  getCircuitos(){
    return this.http.get<ruta[]>(this.appsettings.API_ENDPOINT + `planeacion/logistica/flete/optimo/circuito/getRutasAll`);
  }
  getByCircuito(idCircuito:number){
    return this.http.get<CircuitoFleteOptimo[]>(this.appsettings.API_ENDPOINT + `planeacion/logistica/flete/optimo/circuito/getByIdFleteOptimo/`+idCircuito);
  }
  updateCircuito(circuito:any){
    console.log(circuito);
    return this.http.put(this.appsettings.API_ENDPOINT + `planeacion/logistica/flete/optimo/circuito/update`, circuito)
    .pipe(
      catchError(e => {
        if (e.error.message) {
          console.error(e.error.message);
        }
        return throwError(e);
      })
    );
  }
  getFletesOptimoOficina(oficina:string){
    return this.http.get<flete_optimo[]>(this.appsettings.API_ENDPOINT + `planeacion/logistica/flete/optimo/getByIdOficina/`+oficina);
  }
  getFlete(idFlete:string){
    return this.http.get<flete_optimo[]>(this.appsettings.API_ENDPOINT + `planeacion/logistica/flete/optimo/getById/`+idFlete);
  }

  updateFlete(data:any){
    console.log(data);
    return this.http.put(this.appsettings.API_ENDPOINT + `planeacion/logistica/flete/optimo/update`, data)
    .pipe(
      catchError(e => {
        if (e.error.message) {
          console.error(e.error.message);
        }
        return throwError(e);
      })
    );
  }

  createFlete(flete:any){
    return this.http.post(this.appsettings.API_ENDPOINT + `planeacion/logistica/flete/optimo/create`, flete)
    .pipe(
      catchError(e => {
        if (e.error.message) {
          console.error(e.error.message);
        }
        return throwError(e);
      })
    );
  }
  createCircuito(circuito:any){
    console.log(circuito);
    return this.http.post(this.appsettings.API_ENDPOINT + `planeacion/logistica/flete/optimo/circuito/create`, circuito)
    .pipe(
      catchError(e => {
        if (e.error.message) {
          console.error(e.error.message);
        }
        return throwError(e);
      })
    );
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
