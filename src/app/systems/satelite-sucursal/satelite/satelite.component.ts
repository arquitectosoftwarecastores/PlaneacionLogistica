import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog, } from '@angular/material/dialog';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from 'src/app/authentication/login/auth.service';
import { sateliteService } from 'src/app/services/satelite.service';
import { sucursales_satelite } from '../../../interfaces/sucursales_satelite';
import { oficinasService } from 'src/app/services/oficinas.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Oficina } from 'src/app/interfaces/oficina';
import { forkJoin } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';
import { satelite } from 'src/app/interfaces/satelite';
export interface UserData {
  numero: string;
  personal: string;
  sistema: string;
  tipoUsuario: string;
  roles: string;
}

/** Constants used to fill up our data base. */


@Component({
  selector: 'app-satelite',
  templateUrl: './satelite.component.html',
  styleUrls: ['./satelite.component.css'],
})
export class SateliteComponent implements OnInit {
  public permisoAInsertarAgregar: any = 0;
  private permisoBConsultar: any = 0;
  private permisoCEliminar: any = 0;
  public permisoDActualizar: any = 0;
  private permisoEAutorizar: any = 0;
  private permisoFRechazar: any = 0;
  private permisoHDescargar: any = 0;
  private permisoIImprimir: any = 0;
  public formGroupSatelite: any;

  nombrePerteneceFiltro = new FormControl();
  sateliteFiltro = new FormControl();
  estatusFiltro = new FormControl();
  personalFiltro = new FormControl();
  fechaModFiltro = new FormControl();

  estatus: number = 0;
  modo: string = 'agregar';
  idSateliteSucursal!: number;
  displayedColumns: string[] = ['nombrePertenece', 'nombreSatelite', 'estatus', 'nombrePersonal', 'fechaMod', 'idSucursalSatelite'];
  sucursales: Oficina[] = [];
  satelites: satelite[] = [];
  selectedSucursal: any;
  selectedSatelite: any;
  filteredSucursales: any[] = [];
  filteredSatelites: any[] = [];
  isLoading: boolean = true;

  public dataSource = new MatTableDataSource<sucursales_satelite>();

  private datosEncontrados: any = [];
  @ViewChild('paginator') paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('dialogModificar') dialogModificar!: TemplateRef<any>;
  @ViewChild('dialogAgregar') dialogAgregar!: TemplateRef<any>;
  @ViewChild('tablaSateliteSort', { static: false }) set tablaSateliteSort(tablaSateliteSort: MatSort) {
    if (this.validaInformacion(tablaSateliteSort)) this.dataSource.sort = tablaSateliteSort;
  }
  agregar: any;
  modificar: any;
  constructor(public dialog: MatDialog, private sateliteService: sateliteService, private formBuilder: FormBuilder,
    public snackBar: MatSnackBar, private router: Router, private authService: AuthService, private cdr: ChangeDetectorRef,
    private oficinaService: oficinasService) {
    this.formGroupSatelite = new FormGroup({
      idSucursal: new FormControl(),
      idSatelite: new FormControl(),
      estatusSatelite: new FormControl()
    });

    const SISTEMA: number = 14;
    const MODULO: number = 90;
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
        } else {
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
  ngOnInit(): void {

    this.formGroupSatelite = this.formBuilder.group({
      idSucursal: '',
      idSatelite: '',
      estatusSatelite: ''
    });
    forkJoin([this.oficinaService.getOficinas(), this.sateliteService.getSatelitesFaltantes()]).subscribe(
      ([oficinas, satelite]) => {
        this.sucursales = oficinas;
        this.satelites = satelite;
      },
      (error) => {
        console.error('Error al obtener los datos:', error);
      }
    );



  }

  applyFilter() {
    const filters = {
      nombrePertenece: this.nombrePerteneceFiltro.value,
      nombreSatelite: this.sateliteFiltro.value,
      estatus: this.estatusFiltro.value,
      nombrePersonal: this.personalFiltro.value,
      fechaMod: this.fechaModFiltro.value
    };

    this.dataSource.filterPredicate = (data: sucursales_satelite, filter: string) => {
      const filtersObj = JSON.parse(filter);
      const nombrePerteneceMatch = data.nombrePertenece?.toLowerCase().includes(filtersObj.nombrePertenece?.toLowerCase() || '');
      const nombreSateliteMatch = data.nombreSatelite?.toLowerCase().includes(filtersObj.nombreSatelite?.toLowerCase() || '');
      const estatusMatch = data.estatus?.toString().toLowerCase().includes(filtersObj.estatus?.toLowerCase() || '');
      const nombrePersonalMatch = data.nombrePersonal?.toLowerCase().includes(filtersObj.nombrePersonal?.toLowerCase() || '');
      const fechaModMatch = data.fechaMod?.toString().toLowerCase().includes(filtersObj.fechaMod?.toLowerCase() || '');

      return nombrePerteneceMatch && nombreSateliteMatch && estatusMatch && nombrePersonalMatch && fechaModMatch;
    };

    this.dataSource.filter = JSON.stringify(filters);
  }
  validaInformacion(dato: any): boolean {
    if (dato != undefined && dato != null && dato != '' && dato != "Invalid Date") {
      return true;
    }
    else {
      return false;
    }
  }
  oncloseDialog(): void {
    this.dialog.closeAll();

  }

  openSnackBar(message: string, action: string, tiempo: number): void {
    this.snackBar.open(message, action, {
      duration: tiempo
    });
  }
  openDialog(): void {
    const dialogRef = this.dialog.open(this.dialogModificar);

    dialogRef.afterClosed().subscribe(result => {
      console.log('El modal se ha cerrado');
    });
  }



  toggleCheckbox() {
    this.estatus = this.estatus === 0 ? 1 : 0;
  }
  guardarSatelite() {
    const today = new Date();
    const year = today.getFullYear();
    const month = ("0" + (today.getMonth() + 1)).slice(-2);
    const day = ("0" + today.getDate()).slice(-2);
    const horas = today.getHours();
    const minutos = today.getMinutes();
    const segundos = today.getSeconds();
    const tiempo = `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
    const formattedDate = `${year}-${month}-${day}`;
    const sateliteSeleccionado = this.formGroupSatelite.value.idSatelite;
    console.log(sateliteSeleccionado);
    console.log(sateliteSeleccionado.id);
    const claveSatelite = sateliteSeleccionado.clave;
    const sucursalSeleccionado = this.formGroupSatelite.value.idSucursal;
    console.log(sucursalSeleccionado);
    console.log(sucursalSeleccionado.clave);

    const id = sucursalSeleccionado.id;
    console.log(this.modo);
    if (this.modo === 'agregar') {
      this.agregar = {
        idOficinaSatelite: sateliteSeleccionado.id,
        idOficinaPertenece: sucursalSeleccionado.clave,
        estatus: this.estatus,
        idPersonal: this.obtenerIdPersonal(),
        fechaMod: formattedDate,
        horaMod: formattedDate + 'T' + tiempo
      };
      console.log(this.agregar);
      this.sateliteService.setSatelite(this.agregar).subscribe(
        (success: any) => {
          this.openSnackBar('Se guardo de manera exitosa!', '✅', 3000);
          this.cargarDatos();
          this.oncloseDialog();
        },
        (error: any) => {
          console.log("error");
        });
    } else if (this.modo === 'modificar') {
      this.modificar = {
        idSucursalSatelite: this.idSateliteSucursal,
        idOficinaSatelite: this.formGroupSatelite.value.idSatelite,
        idOficinaPertenece: this.formGroupSatelite.value.idSucursal,
        estatus: this.estatus,
        idPersonal: this.obtenerIdPersonal(),
        fechaMod: formattedDate,
        horaMod: formattedDate + 'T' + tiempo
      };
      console.log(this.modificar);
      this.sateliteService.updateSatelite(this.modificar).subscribe(
        (success: any) => {
          this.openSnackBar('Se modifico de manera exitosa!', '✅', 3000);
        },
        (error: any) => {
          console.log("error");
        });

    }
  }

  obtenerIdPersonal(): string {
    let usuarioJson = JSON.parse(sessionStorage.getItem('usuario')!);;
    return usuarioJson.id;
  }

  abrirModalAgregar() {
    this.modo = 'agregar';
    this.openDialog();
  }

  abrirModalModificar(idSatelite: number) {
    this.modo = 'modificar';
    this.idSateliteSucursal = idSatelite;
    //buscar satelite
    //agregar valores al select
    //aparecer y desaparecer etiquetas

    this.openDialog();
  }

  displayFn(sucursal: any): string {
    this.selectedSatelite = sucursal.clave;
    return sucursal ? sucursal.plaza : '';
  }
  displayFnSatelite(satelite: any): string {
    console.log(satelite);
    return satelite ? satelite.nombre.trim() : '';
  }

  filtrarDatosSucursal(query: string): any[] {
    let filtered: any[] = [];
    if (query) {
      const lowercaseQuery = query.toLowerCase();
      filtered = this.sucursales.filter((sucursal) =>
        sucursal.plaza.toLowerCase().includes(lowercaseQuery)
      );
    } else {
      filtered = this.sucursales;
    }
    return filtered;
  }
  filtrarDatosSatelite(query: string): any[] {
    let filtered: any[] = [];
    if (query) {
      const lowercaseQuery = query.toLowerCase();
      filtered = this.satelites.filter((satelite) =>
        satelite.nombre.toLowerCase().includes(lowercaseQuery)
      );
    } else {
      filtered = this.satelites;
    }
    return filtered;
  }

  onInputSucursales(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const query = inputElement.value;
    this.filteredSucursales = this.filtrarDatosSucursal(query);
  }
  onInputSatelites(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const query = inputElement.value;
    this.filteredSatelites = this.filtrarDatosSatelite(query);
  }
  cargarDatos(){
    this.isLoading = true;
    this.sateliteService.getAllSatelite().subscribe(response => {
      this.dataSource = new MatTableDataSource<sucursales_satelite>(response as sucursales_satelite[]);
      this.dataSource.paginator = this.paginator;
      this.paginator.pageSize = 5;
      this.dataSource.sort = this.tablaSateliteSort;
      this.isLoading = false;
    },
    (error: any) => {
      console.error('Error al obtener los datos:', error);
      this.isLoading = false;
    })
  }

}
