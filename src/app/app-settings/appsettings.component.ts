import { Injectable } from '@angular/core';
@Injectable({
  providedIn: 'root'
})
export class AppsettingsComponent {
  API_ENDPOINT = 'http://back.castores.com.mx:8090/castores/services/';
  ENDPOINT = 'http://back.castores.com.mx:8090/';
}
