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
import { fletesService } from '../../../services/flete.service';
import { flete_optimo } from 'src/app/interfaces/flete';



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
  isLoading: boolean = true;

  displayedColumns: string[] = ['id_oficina', 'cdp', 'bultos', 'contiene', 'volumen', 'origen'];
  dataSource!: MatTableDataSource<flete_optimo>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('dialogTemplate') dialogTemplate!: TemplateRef<any>;
  @ViewChild('modificarglete') modificarglete!: TemplateRef<any>;
  @ViewChild('tablaSateliteSort', { static: false }) set tablaSateliteSort(tablaSateliteSort: MatSort) {
    if (this.validaInformacion(tablaSateliteSort)) this.dataSource.sort = tablaSateliteSort;
  }
  cities!: City[];

  selectedCities!: City[];
  constructor(public snackBar: MatSnackBar, public dialog: MatDialog, private router: Router, private authService: AuthService,
              private fletesService:fletesService) {

    this.cities = [
      {name: 'LEON', code: '1'},
      {name: 'TORREON', code: '2'},
      {name: 'SAN LUIS', code: '3'},
      {name: 'TOLUCA', code: '4'},
      {name: 'MORELIA', code: '5'}
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
        }else{
          this.cargarDatos();
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
    this.dialog.open(this.dialogTemplate);
  }
  openDialogModificar(): void {
    this.dialog.open(this.modificarglete);
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

  validaInformacion(dato: any): boolean {
    if (dato != undefined && dato != null && dato != '' && dato != "Invalid Date") {
      return true;
    }
    else {
      return false;
    }
  }

  cargarDatos() {
    this.isLoading = true;
    this.fletesService.getFletesOptimo().subscribe((response: flete_optimo[]) => {
      console.log(response);
      this.dataSource = new MatTableDataSource<flete_optimo>(response as flete_optimo[]);
      this.dataSource.paginator = this.paginator;
      this.paginator.pageSize = 5;
      this.dataSource.sort = this.tablaSateliteSort;
      this.isLoading = false;
    },
      (error: any) => {
        this.openSnackBar('Hubo un error al cargar los datos', '⛔', 3000);
        this.isLoading = false;
      })
  }
}
