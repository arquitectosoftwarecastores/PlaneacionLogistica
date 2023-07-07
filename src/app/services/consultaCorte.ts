import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { cortes } from '../interfaces/cortes';

import { AppsettingsComponent } from '../app-settings/appsettings.component'



@Injectable()
export class fletesService {

  constructor(private appsettings: AppsettingsComponent, private http: HttpClient, private router: Router) { }
  
  getFleteOptimoFiltro(tipo: string[], venta: string[], origen: string, zonaInfluencia: string): Observable<cortes[]> {
    const url = `${this.appsettings.API_ENDPOINT}oficina/findAgenciaByIdOficina/${tipo},${venta},${origen},${zonaInfluencia}`;
    return this.http.get<cortes[]>(url).pipe(
      catchError((error: HttpErrorResponse) => {
        return throwError(error);
      })
    );
}

  getFleteOptimo(oficina: number):Observable<any>{
    return this.http.get<cortes[]>(this.appsettings.API_ENDPOINT + `oficina/findAgenciaByIdOficina/${oficina}`);
  }
}