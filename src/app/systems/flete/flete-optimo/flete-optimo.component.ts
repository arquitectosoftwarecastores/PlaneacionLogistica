import { AfterViewInit, Component, TemplateRef, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { AuthService } from 'src/app/authentication/login/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';


export interface UserData {
  flete: string;
  cdp: string;
  bultos: string;
  contiene: string;
  volumen: string;
  origen: string;
}
interface City {
  name: string,
  code: string
}
/** Constants used to fill up our data base. */
const FLETE: string[] = [
  'blueberry',

];

const CDP: string[] = [
  'blueberry',
];
const BULTOS: string[] = [
  'Maia',
];
const CONTIENE: string[] = [
  'Maia',
];

const VOLUMEN: string[] = [
  'Maia',
];
const ORIGEN: string[] = [
  'Maia',
];



@Component({
  selector: 'app-flete-optimo',
  templateUrl: './flete-optimo.component.html',
})

export class FleteOptimoComponent implements AfterViewInit {
  public permisoAInsertarAgregar: any = 0;
  public permisoBConsultar: any = 0;
  private permisoCEliminar: any = 0;
  public permisoDActualizar: any = 0;
  private permisoEAutorizar: any = 0;
  private permisoFRechazar: any = 0;
  private permisoHDescargar: any = 0;
  private permisoIImprimir: any = 0;
  displayedColumns: string[] = ['flete', 'cdp', 'bultos', 'contiene', 'volumen', 'origen'];
  dataSource: MatTableDataSource<UserData>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('dialogTemplate') dialogTemplate!: TemplateRef<any>;
  @ViewChild('modificarglete') modificarglete!: TemplateRef<any>;
  cities!: City[];

  selectedCities!: City[];
  constructor(public snackBar: MatSnackBar, public dialog: MatDialog, private router: Router, private authService: AuthService) {

    const users = Array.from({ length: 100 }, (_, k) => createNewUser(k + 1));
    this.dataSource = new MatTableDataSource(users);
    this.cities = [
      {name: 'New York', code: 'NY'},
      {name: 'Rome', code: 'RM'},
      {name: 'London', code: 'LDN'},
      {name: 'Istanbul', code: 'IST'},
      {name: 'Paris', code: 'PRS'}
  ];
    const SISTEMA: number = 14;
    const MODULO: number = 88;

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
        this.openSnackBar('No tienes permisos para entrar a este modulo', '⛔', 3000);
        this.router.navigate(['/home/inicio']);
      }
    } else {
      this.openSnackBar('No tienes permisos para entrar a este modulo', '⛔', 3000);
      this.router.navigate(['/home/inicio']);
    }

  }

  openSnackBar(message: string, action: string, tiempo: number): void {
    this.snackBar.open(message, action, {
      duration: tiempo
    });
  }
  openDialog(): void {
    const dialogRef = this.dialog.open(this.dialogTemplate);
  }
  openDialogModificar(): void {
    const dialogRol = this.dialog.open(this.modificarglete);
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
}

/** Builds and returns a new User. */
function createNewUser(id: number): UserData {
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

  return {
    flete: flete,
    cdp: cdp,
    bultos: bultos,
    contiene: contiene,
    volumen: volumen,
    origen: origen
  };
}
