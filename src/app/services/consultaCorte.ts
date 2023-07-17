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


}
