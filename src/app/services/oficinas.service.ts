import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

import { AppsettingsComponent } from '../app-settings/appsettings.component'
import { Oficina } from '../interfaces/oficina';



@Injectable()
export class oficinasService {

  constructor(private appsettings: AppsettingsComponent, private http: HttpClient, private router: Router) { }

  getOficinas(){
    return this.http.get<Oficina[]>(this.appsettings.API_ENDPOINT + `oficina/findOficinaByAll`);
  }

}
