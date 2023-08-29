import { Component } from '@angular/core';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSidenav } from '@angular/material/sidenav';
import { ViewChild } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule, MatExpansionPanel } from '@angular/material/expansion';
import { InicioCastoresComponent } from '../../inicio-castores/inicio-castores/inicio-castores.component';
import { InicioRoutingModule } from '../inicio-routing.module';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from 'src/app/authentication/login/auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.component.html',
  styleUrls: ['./inicio.component.css'],
  standalone: true,
  imports: [MatToolbarModule, MatButtonModule, MatIconModule, MatSidenavModule, NgIf, MatTabsModule, MatListModule, MatExpansionModule
    , InicioCastoresComponent, NgFor, MatMenuModule, InicioRoutingModule,]
})

export class InicioComponent {
  @ViewChild('panel1') panel1!: MatExpansionPanel;
  @ViewChild('panel2') panel2!: MatExpansionPanel;

  currentPanelIndex: number = -1;
  showFiller = false;
  @ViewChild('sidenav') sidenav!: MatSidenav;
  panelOpenState = false;
  expansionPanels: any;
  public nombreCompletoUsuario: string;

  constructor(private authService: AuthService, private router: Router, public snackBar: MatSnackBar) {
    this.nombreCompletoUsuario = this.obtenerNombre();
  }

  /**
    * openSnackBar: Funcion para ver los mensajes.
    *
    * @param fecha (string)
    * @return Date
    * @author Oswaldo Ramirez [desarrolloti43]
    * @date 2023-06-29
   */
  obtenerNombre(): string {
    let usuarioJson = JSON.parse(sessionStorage.getItem('usuario')!);
    return usuarioJson.nombreCompleto;
  }
  /**
    * openSnackBar: Funcion para ver los mensajes.
    *
    * @param fecha (string)
    * @return Date
    * @author Oswaldo Ramirez [desarrolloti43]
    * @date 2023-06-29
   */
  logout(): void {
    this.authService.cerrarSesion();
    this.openSnackBar('Sesión cerrada.', '👋', 3000);
    this.router.navigate(['/login']).then((resolve) => {
      setTimeout(() => {
        location.reload();
      }, 500);
    });
  }
  /**
    * openSnackBar: Funcion para ver los mensajes.
    *
    * @param fecha (string)
    * @return Date
    * @author Oswaldo Ramirez [desarrolloti43]
    * @date 2023-06-28
   */
  openSnackBar(message: string, action: string, tiempo: number) {
    this.snackBar.open(message, action, {
      duration: tiempo
    });
  }
}
