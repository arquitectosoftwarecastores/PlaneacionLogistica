import { AfterViewInit, Component, TemplateRef, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import {NgFor} from '@angular/common';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  CdkDropListGroup,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/authentication/login/auth.service';

export interface UserData {
  numero: string;
  personal: string;
  sistema: string;
  tipoUsuario: string;
  roles: string;
}

/** Constants used to fill up our data base. */
const NUMERO: string[] = [
  'blueberry',

];

const PERSONAL: string[] = [
  'blueberry',
];
const SISTEMA: string[] = [
  'Maia',
];
const TIPOUSUARIO: string[] = [
  'Maia',
];

const ROLES: string[] = [
  'Maia',
];

@Component({
  selector: 'app-consulta-corte',
  templateUrl: './consulta-corte.component.html',
  styleUrls: ['./consulta-corte.component.css']
})
export class ConsultaCorteComponent {

  public permisoAInsertarAgregar: any = 0;
  public permisoBConsultar: any = 0;
  private permisoCEliminar: any = 0;
  public permisoDActualizar: any = 0;
  private permisoEAutorizar: any = 0;
  private permisoFRechazar: any = 0;
  private permisoHDescargar: any = 0;
  private permisoIImprimir: any = 0;

  displayedColumns: string[] = ['numero', 'personal', 'sistema', 'tipoUsuario', 'roles'];
  dataSource: MatTableDataSource<UserData>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('dialogTemplate') dialogTemplate!: TemplateRef<any>;
  @ViewChild('dialogRoles') dialogRoles!: TemplateRef<any>;

  constructor(public snackBar: MatSnackBar,public dialog: MatDialog, private router: Router, private authService: AuthService) {
    // Create 100 users
    const users = Array.from({ length: 100 }, (_, k) => createNewUser(k + 1));

    // Assign the data to the data source for the table to render
    this.dataSource = new MatTableDataSource(users);

    const SISTEMA: number = 14;
    const MODULO: number = 79;

    let obtienePermisosG = this.authService.validaPermisosGlobales(SISTEMA, MODULO);
    if (obtienePermisosG != undefined) {
      if (obtienePermisosG['respuesta'] == true) {
        this.permisoAInsertarAgregar = (obtienePermisosG['datos']['a'] == 1) ? 1 : 0;
        this.permisoBConsultar = (obtienePermisosG['datos']['b'] == 1) ? 1 : 0;
        this.permisoCEliminar = (obtienePermisosG['datos']['c'] == 1) ? 1 : 0;
        this.permisoDActualizar = (obtienePermisosG['datos']['d'] == 1) ? 1 : 0;
        this.permisoEAutorizar = (obtienePermisosG['datos']['e'] == 1) ? 1 : 0;
        this.permisoFRechazar = (obtienePermisosG['datos']['f'] == 1) ? 1 : 0;
        this.permisoHDescargar = (obtienePermisosG['datos']['h'] == 1) ? 1 : 0;
        this.permisoIImprimir = (obtienePermisosG['datos']['i'] == 1) ? 1 : 0;
        if (this.permisoBConsultar == 0) {
          this.openSnackBar('No tienes permisos para entrar a este modulo', '⛔', 3000);
          this.router.navigate(['/home/inicio']);
        }
      } else {
        this.openSnackBar('No tienes permisos para entrar a este modulo', '⛔',3000);
        this.router.navigate(['/home/inicio']);
      }
    } else {
      this.openSnackBar('No tienes permisos para entrar a este modulo', '⛔',3000);
      this.router.navigate(['/home/inicio']);
    }
  }

  openSnackBar(message: string, action: string, tiempo: number): void
  {
    this.snackBar.open(message, action, {
      duration: tiempo
    });
  }
  openDialog(): void {
    const dialogRef = this.dialog.open(this.dialogTemplate);
  }

  openDialogPermisos(): void {
    const dialogRol = this.dialog.open(this.dialogRoles);
  }

  oncloseDialog(): void {
    this.dialog.closeAll();

  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  items = ['Prueba 1', 'Administrador'];

  basket = ['TI'];

  drop(event: CdkDragDrop<string[]>) {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex,
      );
    }
  }
}
function createNewUser(id: number): UserData {
  const numero =
    NUMERO[Math.round(Math.random() * (NUMERO.length - 1))] +
    ' ' +
    NUMERO[Math.round(Math.random() * (NUMERO.length - 1))].charAt(0) +
    '.';

  const personal = PERSONAL[Math.round(Math.random() * (PERSONAL.length - 1))] +
    ' ' +
    PERSONAL[Math.round(Math.random() * (PERSONAL.length - 1))].charAt(0) +
    '.';

  const sistema = SISTEMA[Math.round(Math.random() * (SISTEMA.length - 1))] +
    ' ' +
    SISTEMA[Math.round(Math.random() * (SISTEMA.length - 1))].charAt(0) +
    '.';
  const tipoUsuario = TIPOUSUARIO[Math.round(Math.random() * (TIPOUSUARIO.length - 1))] +
    ' ' +
    TIPOUSUARIO[Math.round(Math.random() * (TIPOUSUARIO.length - 1))].charAt(0) +
    '.';
  const roles = ROLES[Math.round(Math.random() * (ROLES.length - 1))] +
    ' ' +
    ROLES[Math.round(Math.random() * (ROLES.length - 1))].charAt(0) +
    '.';


  return {
    numero: numero,
    personal: personal,
    sistema: sistema,
    tipoUsuario: tipoUsuario,
    roles: roles,
  };
}
