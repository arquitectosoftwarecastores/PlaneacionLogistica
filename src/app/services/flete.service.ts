import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { flete_optimo } from '../interfaces/flete';

import { AppsettingsComponent } from '../app-settings/appsettings.component'



@Injectable()
export class fletesService {

  constructor(private appsettings: AppsettingsComponent, private http: HttpClient, private router: Router) { }

  getFletesOptimo(){
    return this.http.get<flete_optimo[]>(this.appsettings.API_ENDPOINT + `planeacion/logistica/flete/optimo/getAll`);
  }
}
