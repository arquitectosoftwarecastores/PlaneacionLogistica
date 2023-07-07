import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from '../auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router, public snackBar: MatSnackBar) { }
  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 3000
    });
  }
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (!this.authService.isAuthenticated()) {
      this.openSnackBar('No tienes permisos para entrar a este modulo', '⛔');
      this.router.navigate(['/home/logo']);
      return false;
    }

    let sistema = next.data['sistema'] as number;
    let modulo = next.data['modulo'] as number;
    if (this.authService.hasPermission(sistema, modulo)) {
      return true;
    }
    this.openSnackBar('No tienes permisos para este recurso', '⛔');
    this.router.navigate(['/e401']);
    return false;
  }
}
