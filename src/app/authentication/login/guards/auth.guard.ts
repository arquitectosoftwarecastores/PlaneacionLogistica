import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';
//auth guard nos sirve como redireccionador, al preguntar si el usuario tiene acceso, si no será redirigido
//también valida si la ruta es cambiada desde el navegador, pueda evaluarse el acceso
@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) { }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.authService.isAuthenticated()) {
      if (this.istokenExpired()) {
        this.authService.cerrarSesion();
        this.router.navigate(['/login']);
        return false;
      }
      return true;
    }
    this.router.navigate(['/login'])
    return false;
  }
  istokenExpired(): boolean {
    let token = this.authService.token;
    let payload = this.authService.obtenerDatosTokenPayload(token!);
    let now = new Date().getTime() / 1000;
    if (payload.exp < now) {
      return true;
    }
    return false;
  }
}
