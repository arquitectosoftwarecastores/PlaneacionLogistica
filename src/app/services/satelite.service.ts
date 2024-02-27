import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AppsettingsComponent } from '../app-settings/appsettings.component'
import { satelite } from '../interfaces/satelite';
import { sucursales_satelite } from '../interfaces/sucursales_satelite';
import { cedis } from '../interfaces/oficina';
import { MatSnackBar } from '@angular/material/snack-bar';



@Injectable()
export class sateliteService {

  constructor(private appsettings: AppsettingsComponent, private http: HttpClient, private router: Router,public snackBar: MatSnackBar) { }

  getSucursalSatelite(sucursal: number, oficina: number):Observable<any>{
    return this.http.get<sucursales_satelite[]>(this.appsettings.API_ENDPOINT + `planeacion/logistica/sucursal/satelite/getByIdOficinaSatelite/${oficina}?sucursal=${sucursal}`);
  }

  getAllSatelite():Observable<any>{
    return this.http.get<sucursales_satelite[]>(this.appsettings.API_ENDPOINT + `planeacion/logistica/sucursal/satelite/getAll`);
  }

  setSatelite(data:any){
    return this.http.post(this.appsettings.API_ENDPOINT + `planeacion/logistica/sucursal/satelite/create/`, data)
    .pipe(
      catchError(e => {
        if (e.error.message) {
          this.openSnackBar(e.error.message, '⛔');
        }
        return throwError(e);
      })
    );
  }
  updateSatelite(data:any){
    return this.http.put(this.appsettings.API_ENDPOINT + `planeacion/logistica/sucursal/satelite/update`, data)
    .pipe(
      catchError(e => {
        if (e.error.message) {
          this.openSnackBar(e.error.message, '⛔');
        }
        return throwError(e);
      })
    );
  }
  getSatelitesFaltantes(){
    return this.http.get<cedis[]>(this.appsettings.API_ENDPOINT + `planeacion/logistica/sucursal/satelite/getOficinasFaltantes`);
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 3000
    });
  }

}
