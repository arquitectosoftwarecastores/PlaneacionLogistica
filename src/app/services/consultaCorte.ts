import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { cortes } from '../interfaces/cortes';

import { AppsettingsComponent } from '../app-settings/appsettings.component'



@Injectable()
export class consultaCorteService {

  constructor(private appsettings: AppsettingsComponent, private http: HttpClient, private router: Router) { }

  setCorte(corte:any){
      return this.http.post(this.appsettings.API_ENDPOINT + `planeacion/logistica/corte/create/`, corte)
      .pipe(
        catchError(e => {
          if (e.error.message) {
            console.error(e.error.message);
          }
          return throwError(e);
        }
      )
    );
  }
}

