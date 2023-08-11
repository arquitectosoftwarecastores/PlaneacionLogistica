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
import { Select2OptionData } from 'ng-select2';
import { Options } from 'select2';
import { cedis } from 'src/app/interfaces/oficina';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { zonasInfluencia } from 'src/app/interfaces/zonasInfluencia';
import { forkJoin } from 'rxjs';
import { oficinasService } from '../../../services/oficinas.service';
import { sateliteService } from 'src/app/services/satelite.service';
import { circuito } from 'src/app/interfaces/circuitos';


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
  styleUrls: ['./flete-optimo.component.css']
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
  sucursales: cedis[] = [];
  filteredSucursales: any[] = [];
  defaultSatelite = '';
  placeholderSucursal = '';
  selectedSatelite: any;
  public formGroupFlete: any;
  zonasInfluencia: zonasInfluencia[] = [];
  filteredZonas: any[] = [];
  ruta: circuito[] = [];
  selectedZonasInfluencia: any;
  isDisabled: boolean = false;
  isDivBlocked: boolean = true;
  estatus: number = 0;
  displayedColumns: string[] = ['nombreOficina', 'nombreZona', 'cantidadFleteOptimo', 'estatus','circuito'];
  dataSource!: MatTableDataSource<flete_optimo>;
  modo: string = 'agregar';
  ngSelect:boolean=false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('dialogTemplate') dialogTemplate!: TemplateRef<any>;
  @ViewChild('modificarglete') modificarglete!: TemplateRef<any>;
  @ViewChild('tablaFleteOptimoSort', { static: false }) set tablaFleteOptimoSort(tablaFleteOptimoSort: MatSort) {
    if (this.validaInformacion(tablaFleteOptimoSort)) this.dataSource.sort = tablaFleteOptimoSort;
  }
  public exampleData!: Array<Select2OptionData>;
  public options!: Options;
  public _value!: string[];

  constructor(public snackBar: MatSnackBar, public dialog: MatDialog, private router: Router, private authService: AuthService,
              private fletesService:fletesService,private formBuilder: FormBuilder, public oficinaService:oficinasService, public sateliteService: sateliteService) {


    const SISTEMA: number = 14;
    const MODULO: number = 80;

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
    this.formGroupFlete = new FormGroup({
      idSucursal: new FormControl(),
      zona: new FormControl(),
      estatus: new FormControl(),
      flete: new FormControl(),
      circuitos:new FormControl()
    });
    this.formGroupFlete = this.formBuilder.group({
      idSucursal: [null, Validators.compose([Validators.required])],
      zona: [null, Validators.compose([Validators.required])]
    });
    this.formGroupFlete = this.formBuilder.group({
      idSucursal: '',
      zona: '',
      estatus: '',
      flete: '',
      circuitos:[]
    });

    this._value = [];

    this.options = {
      width: '300',
      multiple: true,
      tags: true
    };
    this.cargarSatelitesSucursales();
  }
  cargarSatelitesSucursales() {
    forkJoin([
      this.oficinaService.getOficinas(),
      this.oficinaService.getZonasInfluencia(),
      this.fletesService.getCircuitos()
    ]).subscribe(
      ([oficinas, zona, circuitos]) => {
        console.log(zona);
        this.sucursales = oficinas;
        this.zonasInfluencia = zona;
        console.log(circuitos);
        this.ruta=circuitos;
        this.actualizarExampleData();
      },
      (error) => {
        this.openSnackBar('Hubo un error al consultar', '⛔', 3000);
      }
    );
  }
  actualizarExampleData() {
    this.exampleData = this.ruta.map(item => ({
      id: item.idRuta.toString(),
      text: item.nombreRuta.toString()
    }));
  }

  get value(): string[] {
    return this._value;
  }
  set value(value: string[]) {
    this._value = value;
  }
  obtenerIdOficina(): string {
    let idoficinaJson = JSON.parse(sessionStorage.getItem('usuario')!);
    return idoficinaJson.claveOficina;
  }
  openSnackBar(message: string, action: string, tiempo: number): void {
    this.snackBar.open(message, action, {
      duration: tiempo
    });
  }

  openDialog(): void {
    this.dialog.open(this.dialogTemplate);
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
    if (this.obtenerIdOficina() == '1100') {
      this.fletesService.getFletesOptimo().subscribe(
        (success: any) => {
          console.log(success);
          this.isLoading = false;
          this.dataSource = new MatTableDataSource<flete_optimo>(success as flete_optimo[]);
          this.dataSource.paginator = this.paginator;
          this.paginator.pageSize = 5;
          this.dataSource.sort = this.tablaFleteOptimoSort;
          this.openSnackBar('Se realizo la consulta de manera exitosa.', '✅', 3000);
        },
        (error: any) => {
          this.openSnackBar('Hubo un error al hcaer la consulta.', '⛔', 3000);
        });
    } else {
      this.fletesService.getFletesOptimoOficina(this.obtenerIdOficina()).subscribe(
        (success: any) => {
          console.log(success);
          this.isLoading = false;
          this.dataSource = new MatTableDataSource<flete_optimo>(success as flete_optimo[]);
          this.dataSource.paginator = this.paginator;
          this.paginator.pageSize = 5;
          this.dataSource.sort = this.tablaFleteOptimoSort;
          this.openSnackBar('Se realizo la consulta de manera exitosa.', '✅', 3000);
        },
        (error: any) => {
          this.openSnackBar('Hubo un error al hcaer la consulta.', '⛔', 3000);
        });
    }
  }
  onInputSucursales(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const query = inputElement.value;
    this.filteredSucursales = this.filtrarDatosSucursal(query);
  }
  filtrarDatosSucursal(query: string): any[] {
    let filtered: any[] = [];
    if (query) {
      const lowercaseQuery = query.toLowerCase();
      filtered = this.sucursales.filter((sucursal) =>
        sucursal.nombre.toLowerCase().includes(lowercaseQuery)
      );
    } else {
      filtered = this.sucursales;
    }
    return filtered;
  }
  displayFn(sucursal: any): string {
    this.selectedSatelite = sucursal.id;
    return sucursal ? sucursal.nombre : '';
  }
  displayFnZonas(zona: any): string {
    if (zona) {
      this.selectedZonasInfluencia = zona.idZona;
      return zona.nombre;
    } else {
      return '';
    }
  }
  onInputZonas(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const query = inputElement.value;
    this.filteredZonas = this.filtrarDatosZonasInfluencia(query);
  }

  filtrarDatosZonasInfluencia(query: string): any[] {
    let filteredZona: any[] = [];
    if (query) {
      const lowercaseQuery = query.toLowerCase();
      filteredZona = this.zonasInfluencia.filter((zona) =>
        zona.nombre.toLowerCase().includes(lowercaseQuery)
      );
    } else {
      filteredZona = this.zonasInfluencia;
    }
    return filteredZona;
  }
  toggleCheckbox() {
    this.estatus = this.estatus === 0 ? 1 : 0;
  }
  onKeyPress(event: KeyboardEvent) {
    // Permitir solo teclas numéricas y ciertas teclas especiales (por ejemplo, backspace)
    const allowedKeys = [8, 37, 39, 46];
    if (
      allowedKeys.indexOf(event.keyCode) === -1 &&
      (event.keyCode < 48 || event.keyCode > 57) && // Dígitos
      (event.key !== ',' && event.key !== '.') // Separador decimal
    ) {
      event.preventDefault();
    }
  }

  onInput(event: any) {
    // Remover caracteres no numéricos usando una expresión regular
    event.target.value = event.target.value
      .replace(/[^0-9.,]/g, '') // Permitir solo dígitos y separador decimal
      .replace(/(,.*?),(.*?)/g, '$1.$2'); // Convertir coma a punto en el separador decimal

    // Limitar a dos decimales
    const parts = event.target.value.split('.');
    if (parts.length > 1) {
      parts[1] = parts[1].slice(0, 2); // Solo tomar los primeros dos dígitos después del punto
      event.target.value = parts.join('.');
    }
  }

  guardarFlete() {
    const today = new Date();
    const year = today.getFullYear();
    const month = ("0" + (today.getMonth() + 1)).slice(-2);
    const day = ("0" + today.getDate()).slice(-2);
    const horas = today.getHours();
    const minutos = today.getMinutes();
    const segundos = today.getSeconds();
    const tiempo = `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
    const formattedDate = `${year}-${month}-${day}`;
    const zonaSeleccionado = this.formGroupFlete.value.zona;
    const sucursalSeleccionado = this.formGroupFlete.value.idSucursal;
    const cantidadFlete=this.formGroupFlete.value.flete;



    if (this.modo === 'agregar') {
      const agregar= {
        idZona: zonaSeleccionado.idZona,
        idOficina: sucursalSeleccionado.id,
        cantidadFleteOptimo:cantidadFlete,
        estatus: this.estatus,
        idPersonal: this.obtenerIdPersonal(),
        fechaMod: formattedDate,
        horaMod: formattedDate + 'T' + tiempo
      };

      this.fletesService.createFlete(agregar).subscribe(
        (success: any) => {
          this.openSnackBar('Se guardo de manera exitosa!', '✅', 3000);
          this.cargarSatelitesSucursales();
          this.cargarDatos();
        },
        (error: any) => {
          this.openSnackBar('Hubo un error al guardar', '⛔', 3000);
        });
    }

    else if (this.modo === 'modificar') {
      const modificar = {
        idFleteOptimo: 2,
        idOficina: sucursalSeleccionado,
        idZona: zonaSeleccionado,
        cantidadFleteOptimo: cantidadFlete,
        estatus: 1,
        idPersonal: this.obtenerIdPersonal(),
        fechaMod: formattedDate,
        horaMod: formattedDate + 'T' + tiempo
      };

      this.fletesService.updateFlete(modificar).subscribe(
        (success: any) => {
          //aqui se guarda los circuitos
          this.openSnackBar('Se modifico de manera exitosa!', '✅', 3000);
          this.cargarSatelitesSucursales();
          this.cargarDatos();
        },
        (error: any) => {
          this.openSnackBar('Hubo un error al guardar', '⛔', 3000);
        });

    }
    this.oncloseDialog();
  }

  abrirModalAgregar() {
    this.modo = 'agregar';
    this.formGroupFlete.get('idSucursal').setValue('');
    this.formGroupFlete.get('zona').setValue('');
    this.placeholderSucursal = '';
    this.estatus=1;
    this.isDivBlocked=true;
    this.ngSelect=false;
    this.formGroupFlete.controls['estatus'].setValue(true);
    this.openDialog();
  }

  abrirModalModificar(idSatelite: number) {
    console.log(idSatelite);
    this.modo = 'modificar';
    this.fletesService.getByFletesOptimo(idSatelite).subscribe(response => {
      this.formGroupFlete.controls['estatus'].setValue(response.estatus === 1 ? true : false);
        this.openDialog();
      }, (error: any) => {
        this.openSnackBar('Hubo un error al consultar el satelite', '⛔', 3000);
      });

    this.isDisabled=false;
    this.isDivBlocked=false
    this.ngSelect=true;
  }

  obtenerIdPersonal(): string {
    let usuarioJson = JSON.parse(sessionStorage.getItem('usuario')!);
    return usuarioJson.id;
  }
}
