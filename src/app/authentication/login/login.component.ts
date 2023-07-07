import { Component } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import {NgIf} from '@angular/common';
import { Usuario } from './usuario';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {

  public form!: FormGroup;
  usuario!: Usuario;



  constructor(private fb: FormBuilder, private router: Router, private authService: AuthService, public snackBar: MatSnackBar) {
    this.usuario = new Usuario();
    this.form = new FormGroup({
      user: new FormControl(),
      password: new FormControl()
    });
  }
  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 3000
    });

  }
  ngOnInit() {
    this.form = this.fb.group({
      user: [null, Validators.compose([Validators.required])],
      password: [null, Validators.compose([Validators.required])]
    });

  }

  acceso(): void {

    this.authService.cerrarSesion();
    this.authService.accesoServ(this.form).subscribe( response => {
      this.authService.guardarToken(response.access_token);
      this.authService.getUsrInfo(this.form.get('user')!.value).subscribe(response2 => {
        this.authService.guardarUsuario(response.access_token,response2);
        const usuario = this.authService.usuario;
          this.router.navigate(['/home']);
          this.openSnackBar(`Bienvenido, ${usuario.nombreCompleto}!`, '🖖👽');
      });

    },
      err => {
        console.log(err)
        switch (err.status) {
          case 400:
            this.openSnackBar('Credenciales inválidas.400', '⛔');
            break;
          case 401:
            this.openSnackBar('El servidor no responde.401', '🔌');
            this.router.navigate(['/login']);
            break;
          case 500:
            this.openSnackBar('El servidor no responde.500', '🔌');
            break;
          default:
            this.openSnackBar('Hubo un error de conexion, favor de recargar la pagina', '🔌');
            break;
        }
      }
    );

  }
}
