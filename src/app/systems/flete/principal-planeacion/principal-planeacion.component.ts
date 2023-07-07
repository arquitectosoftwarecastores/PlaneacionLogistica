import { AfterViewInit, Component, TemplateRef, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSelectModule } from '@angular/material/select';
import { NgFor } from '@angular/common';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  CdkDropListGroup,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { AuthService } from 'src/app/authentication/login/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';


export interface fleteData {
  flete: string;
  cdp: string;
  bultos: string;
  contiene: string;
  volumen: string;
  origen: string;
  destino: string;
}

/** Constants used to fill up our data base. */
const FLETE: string[] = [
  ' ',
];

const CDP: string[] = [
  ' ',
];
const BULTOS: string[] = [
  ' ',
];
const CONTIENE: string[] = [
  ' ',
];

const VOLUMEN: string[] = [
  ' ',
];
const ORIGEN: string[] = [
  ' ',
];

const DESTINO: string[] = [
  ' ',
];


@Component({
  selector: 'app-principal-planeacion',
  templateUrl: './principal-planeacion.component.html',
  styleUrls: ['./principal-planeacion.component.css'],
})
export class PrincipalPlaneacionComponent {
  public permisoAInsertarAgregar: any = 0;
  private permisoBConsultar: any = 0;
  private permisoCEliminar: any = 0;
  public permisoDActualizar: any = 0;
  private permisoEAutorizar: any = 0;
  private permisoFRechazar: any = 0;
  private permisoHDescargar: any = 0;
  private permisoIImprimir: any = 0;

  displayedColumns: string[] = ['index', 'talon', 'talontipo', 'flete', 'cdp', 'bultos', 'contiene', 'volumen', 'noEconomico', 'origen', 'tipoVenta', 'destino'];
  dataSource: MatTableDataSource<fleteData>;
  toppings = new FormControl('');
  toppingList: string[] = ['opcion 1', 'opcion 2', 'opcion 3'];
  fleteFilter = new FormControl();
  cdpFilter = new FormControl();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('dialogTemplate') dialogTemplate!: TemplateRef<any>;
  @ViewChild('dialogRoles') dialogRoles!: TemplateRef<any>;
  Flete: any;

  constructor(public dialog: MatDialog, private authService: AuthService, public snackBar: MatSnackBar, private router: Router) {
    const SISTEMA: number = 14;
    const MODULO: number = 86;


    const users = Array.from({ length: 5 }, (_, k) => createNewUser(k + 1));
    this.dataSource = new MatTableDataSource(users);
    let obtienePermisosG = this.authService.validaPermisosGlobales(SISTEMA, MODULO);
    console.log(obtienePermisosG)
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
          this.openSnackBar('No tienes permisos para entrar a este modulo', '⛔');
          this.router.navigate(['/home/inicio']);
        }
      } else {
        this.openSnackBar('No tienes permisos para entrar a este modulo', '⛔');
        this.router.navigate(['/home/inicio']);
      }
    } else {
      this.openSnackBar('No tienes permisos para entrar a este modulo', '⛔');
      this.router.navigate(['/home/inicio']);
    }
  }

  openSnackBar(message: string, action: string) {
    this.snackBar.open(message, action, {
      duration: 3000
    });
  }
  openDialog(): void {
    const dialogRef = this.dialog.open(this.dialogTemplate);

    dialogRef.afterClosed().subscribe(result => {
      console.log('El modal se ha cerrado');
    });
  }
  openDialogPermisos(): void {
    const dialogRol = this.dialog.open(this.dialogRoles);

    dialogRol.afterClosed().subscribe(result => {
      console.log('El modal se ha cerrado');
    });
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
  applyFilter1(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  items = ['Carrots', 'Tomatoes', 'Onions', 'Apples', 'Avocados'];

  basket = ['Oranges', 'Bananas', 'Cucumbers'];

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
  getColumnIndex(columnName: string): number {
    return this.displayedColumns.indexOf(columnName);
  }
}

function createNewUser(id: number): fleteData {
  const flete =
    FLETE[Math.round(Math.random() * (FLETE.length - 1))] +
    ' ' +
    FLETE[Math.round(Math.random() * (FLETE.length - 1))].charAt(0) +
    '.';

  const cdp = CDP[Math.round(Math.random() * (CDP.length - 1))] +
    ' ' +
    CDP[Math.round(Math.random() * (CDP.length - 1))].charAt(0) +
    '.';

  const bultos = BULTOS[Math.round(Math.random() * (BULTOS.length - 1))] +
    ' ' +
    BULTOS[Math.round(Math.random() * (BULTOS.length - 1))].charAt(0) +
    '.';
  const contiene = CONTIENE[Math.round(Math.random() * (CONTIENE.length - 1))] +
    ' ' +
    CONTIENE[Math.round(Math.random() * (CONTIENE.length - 1))].charAt(0) +
    '.';
  const volumen = VOLUMEN[Math.round(Math.random() * (VOLUMEN.length - 1))] +
    ' ' +
    VOLUMEN[Math.round(Math.random() * (VOLUMEN.length - 1))].charAt(0) +
    '.';

  const origen = ORIGEN[Math.round(Math.random() * (ORIGEN.length - 1))] +
    ' ' +
    ORIGEN[Math.round(Math.random() * (ORIGEN.length - 1))].charAt(0) +
    '.';
  const destino = DESTINO[Math.round(Math.random() * (DESTINO.length - 1))] +
    ' ' +
    DESTINO[Math.round(Math.random() * (DESTINO.length - 1))].charAt(0) +
    '.';
  return {
    flete: flete,
    cdp: cdp,
    bultos: bultos,
    contiene: contiene,
    volumen: volumen,
    origen: origen,
    destino: destino
  };

}
