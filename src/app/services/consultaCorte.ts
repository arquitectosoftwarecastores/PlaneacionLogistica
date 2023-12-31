import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { cortesPlaneacion } from '../interfaces/cortes';

import { AppsettingsComponent } from '../app-settings/appsettings.component'
import { DatosTalon } from '../interfaces/datosTalon';
import { MatSnackBar } from '@angular/material/snack-bar';



@Injectable()
export class consultaCorteService {

  constructor(private appsettings: AppsettingsComponent, private http: HttpClient, private router: Router,public snackBar: MatSnackBar) { }
  private detallesTablaList: any[] = [];

  setCorte(corte:any){
      return this.http.post(this.appsettings.API_ENDPOINT + `planeacion/logistica/corte/create/`, corte)
      .pipe(
        catchError(e => {
          if (e.error.message) {
            this.openSnackBar(e.error.message, '⛔');
          }
          return throwError(e);
        }
      )
    );
  }

  getAllCortes(filtro:any){
    return this.http.post<cortesPlaneacion[]>(this.appsettings.API_ENDPOINT + `planeacion/logistica/corte/getAll/`,filtro);
  }
  getCortesOficinas(filtro:any){
    return this.http.post<cortesPlaneacion[]>(this.appsettings.API_ENDPOINT + `planeacion/logistica/corte/getByIdOficina/`,filtro);
  }

  getFindbyCorte(corte:string){
    const corteDetalle=corte.replace(/"/g, '');
    return this.http.get<cortesPlaneacion[]>(this.appsettings.API_ENDPOINT + `planeacion/logistica/corte/getByIdCorte/`+corteDetalle);
  }


  setDatosTabla(datos: DatosTalon[]): void {
    this.detallesTablaList = datos;
  }

  getDatosTabla(): DatosTalon[] {
    return this.detallesTablaList;
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 3000
    });
  }

}

