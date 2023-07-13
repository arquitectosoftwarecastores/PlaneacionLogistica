import { Injectable } from '@angular/core';

import { Observable, throwError } from 'rxjs';
import { Subject } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Usuario } from './usuario';
import { OficinaActual } from '../../interfaces/oficina-actual';
import { FormGroup } from '@angular/forms';
import { AppsettingsComponent } from './../../app-settings/appsettings.component';
import { catchError} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})

export class AuthService {

  private _usuario!: Usuario;
  private _token!: string;
  private _oficinaActual!: OficinaActual;
  private _oficinaActual$: Subject<OficinaActual> = new Subject<OficinaActual>();

  constructor(private http: HttpClient, private AppSettings: AppsettingsComponent) { }

  public get usuario(): Usuario {
    if (this._usuario != null) {
      return this._usuario;
    } else if (this._usuario == null && sessionStorage.getItem('usuario') != null) {
      this._usuario = JSON.parse(sessionStorage.getItem('usuario')!) as Usuario;
      return this._usuario;
    }
    return new Usuario();
  }

  public get token(): string | null {
    if (this._token != null) {
      return this._token;
    } else if (this._token == null && sessionStorage.getItem('token') != null) {
      this._token = sessionStorage.getItem('token')!;
      return this._token;
    }
    return null;
  }

  public get oficinaActual(): OficinaActual {
    return this._oficinaActual as OficinaActual;
  }

  public getOficinaActual$(): Observable<OficinaActual> {
    return this._oficinaActual$.asObservable();
  }

  accesoServ(usuario: FormGroup): Observable<any> {
    const urlEndPoint = this.AppSettings.ENDPOINT + 'api/security/oauth/token';
    const credenciales = btoa('postmanApp' + ':' + '12345');
    const httpHeaders = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
      'Authorization': 'Basic ' + credenciales
    });

    const params = new URLSearchParams();
    params.set('grant_type', 'password');
    params.set('username', usuario.get('user')!.value);
    params.set('password', usuario.get('password')!.value);
    return this.http.post<any>(urlEndPoint, params.toString(), { headers: httpHeaders });
  }
  getUsrInfo(usuario: string): Observable<any> {
    let data = {
      "usuario": usuario
    }

    return this.http.post(this.AppSettings.API_ENDPOINT + `personal/getInfoBySistema/14`,data).pipe(
      catchError(e => {
        if (e.error.message) {
          console.error(e.error.message);
        }
        return throwError(e);
      })
    );
  }

  guardarUsuario(accesstoken: string, response: any): void {
    const payload = this.obtenerDatosTokenPayload(accesstoken);

      this._usuario = new Usuario();
      this._usuario.expiresIn = payload.heweexpirandoando;
      this._usuario.username = payload.user_name; this._usuario.id = response.idUsuario;
      this._usuario.idPersonal= response.idPersonal;
      this._usuario.nombre = response.nombre;
      this._usuario.idPuesto = response.idPuesto;
      this._usuario.apellido = response.apellidoPaterno;
      this._usuario.nombreCompleto = response.nombreCompleto;
      this._usuario.menu = response.MENUITEMS;
      this._usuario.idOficina = response.idOficina;
      this._usuario.plazaOficina = response.plazaOficina;
      this._usuario.claveOficina = response.claveOficina;
      this._usuario.prefijoOficina = response.prefijoOficina;
      this._usuario.roles = response.authorities;
      this._usuario.permisos = response.permissions;
      this._usuario.idDepartamento = response.idDepartamento;
      this._usuario.departamento = response.departamento;
      this._usuario.ultimoAcceso = response.ultimoAcceso;
      this._oficinaActual = new OficinaActual();
      this._oficinaActual.idOficina = response.idOficina;
      this._oficinaActual.plaza = response.plazaOficina;
      this._oficinaActual.clave = response.claveOficina;
      this._oficinaActual.prefijo = response.prefijoOficina;
      this._oficinaActual$.next(this._oficinaActual);
      sessionStorage.setItem("usuario", JSON.stringify(this._usuario));
      localStorage.setItem("usuario", JSON.stringify(this._usuario));

  }

  obtenerPermisosModulo(sistema: number, modulo: number): any {

    const permisos = this.usuario.permisos as Array<any>;
    try {
      const filteredElements = permisos.find(element => element.idSistema == sistema);

      const filteredModule = filteredElements.module.find((element: { idModulo: number; }) => element.idModulo == modulo);
      return filteredModule.permission;
    } catch (e) {
      return '401';
    }
  }
  /* Se validan los permisos globales */
  validaPermisosGlobales(sistema: number, modulo: number): any {
    const permisosG = this.usuario.permisos as Array<any>;
    const respuesta: any = {
      'respuesta': '',
      'datos': ''
    };
    try {
      const filteredElementsG = permisosG.find(element => element.idSistema == sistema);
      const filteredModuleG = filteredElementsG.module.find((element: { idModulo: number; }) => element.idModulo == modulo);

      respuesta['respuesta'] = true;
      respuesta['datos'] = filteredModuleG.permission;
      return respuesta;
    } catch (e) {
      respuesta['respuesta'] = false;
    }

  }
  guardarToken(accesstoken: string): void {
    this._token = accesstoken;
    sessionStorage.setItem('token', accesstoken);
  }

  obtenerDatosTokenPayload(accesstoken: string): any {
    if (accesstoken != null) {
      return JSON.parse(decodeURIComponent(escape(window.atob(accesstoken.split('.')[1]))));
    }
    return null;
  }

  isAuthenticated(): boolean {
    const payload = this.obtenerDatosTokenPayload(this.token!);
    if (payload != null && payload.user_name && payload.user_name.length > 0) {
      return true;
    }
    return false;
  }

  cerrarSesion(): void {
    this._token = "";
    this._usuario = new Usuario;
    sessionStorage.clear();
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('usuario');
  }

  hasPermission(sistema: number, modulo: number): boolean {
    const permiso = this.obtenerPermisosModulo(sistema, modulo);
    if (JSON.stringify(permiso).includes('401')) {
      return false;
    }
    return true;
  }
}
