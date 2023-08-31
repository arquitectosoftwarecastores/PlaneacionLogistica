import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
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
import { ruta } from 'src/app/interfaces/ruta';
import { CircuitoFleteOptimo } from 'src/app/interfaces/circuitos';
import { CustomPaginator } from 'src/app/shared/paginator/custompaginator';
import * as moment from 'moment';



@Component({
  selector: 'app-flete-optimo',
  templateUrl: './flete-optimo.component.html',
  styleUrls: ['./flete-optimo.component.css'],
  providers: [
    { provide: MatPaginatorIntl, useValue: CustomPaginator() }
  ]
})

export class FleteOptimoComponent implements OnInit {
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
  ruta: ruta[] = [];
  listCircuitos: CircuitoFleteOptimo[] = [];
  fleteDetalles!: flete_optimo;
  selectedZonasInfluencia: any;
  isDisabled: boolean = false;
  isDivBlocked: boolean = true;
  estatus: number = 0;
  displayedColumns: string[] = ['nombreOficina', 'nombreZona', 'cantidadFleteOptimo', 'estatus', 'listaCircuitos', 'circuito'];
  dataSource!: MatTableDataSource<flete_optimo>;
  modo: string = 'agregar';
  ngSelect: boolean = false;
  circuitosActuales: CircuitoFleteOptimo[] = [];
  idFleteOptimo!: number;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('dialogTemplate') dialogTemplate!: TemplateRef<any>;
  @ViewChild('dialogCircuitos') dialogCircuitos!: TemplateRef<any>;
  @ViewChild('tablaFleteOptimoSort', { static: false }) set tablaFleteOptimoSort(tablaFleteOptimoSort: MatSort) {
    if (this.validaInformacion(tablaFleteOptimoSort)) this.dataSource.sort = tablaFleteOptimoSort;
  }
  public exampleData!: Array<Select2OptionData>;
  public options!: Options;
  public _value!: string[];
  public selectedOrder: string[] = [];

  origenFiltro = new FormControl();
  zonaInfluenciaFiltro = new FormControl();
  FleteFiltro = new FormControl();
  personalFiltro = new FormControl();
  estatusFiltro = new FormControl();

  constructor(public snackBar: MatSnackBar, public dialog: MatDialog, private router: Router, private authService: AuthService,
    private fletesService: fletesService, private formBuilder: FormBuilder, public oficinaService: oficinasService, public sateliteService: sateliteService) { }


  ngOnInit(): void {
    // Numero de sistema y modulo del componente
    const SISTEMA: number = 14;
    const MODULO: number = 80;
    // mostrar todas las columnas del mat-table
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
          this.cargarDatos('Flete optimo.');
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
      circuitos: new FormControl()
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
      circuitos: []
    });

    this._value = [];

    this.options = {
      width: '300',
      multiple: true,
      tags: true
    };
    this.cargarFletesOptimos();
  }

  /**
    * cargarFletesOptimos: Funcion para limpiar formulario para la busqueda de los talones.
    *
    * @param fecha (string)
    * @return Date
    * @author Oswaldo Ramirez [desarrolloti43]
    * @date 2023-08-15
   */

  cargarFletesOptimos() {
    forkJoin([
      this.oficinaService.getOficinas(),
      this.oficinaService.getZonasInfluencia(),
      this.fletesService.getCircuitos()
    ]).subscribe(
      ([oficinas, zona, circuitos]) => {

        this.sucursales = oficinas;
        this.zonasInfluencia = zona;

        this.ruta = circuitos;
        this.actualizarExampleData();
      },
      (error) => {
        this.openSnackBar('Hubo un error al consultar', '⛔', 3000);
      }
    );
  }
  /**
    * actualizarExampleData: Funcion para limpiar formulario para la busqueda de los talones.
    *
    * @param fecha (string)
    * @return Date
    * @author Oswaldo Ramirez [desarrolloti43]
    * @date 2023-08-17
   */

  actualizarExampleData() {
    this.exampleData = this.ruta.map(item => ({
      id: item.idRuta.toString(),
      text: item.nombreRuta.toString()
    }));
  }

  /**
    * limpiarFormulario: Funcion para limpiar formulario para la busqueda de los talones.
    *
    * @param fecha (string)
    * @return Date
    * @author Oswaldo Ramirez [desarrolloti43]
    * @date 2023-08-17
   */

  get value(): string[] {
    return this._value;
  }
  set value(value: string[]) {
    this._value = value;
  }

  /**
    * obtenerIdOficina: Funcion para limpiar formulario para la busqueda de los talones.
    *
    * @param fecha (string)
    * @return Date
    * @author Oswaldo Ramirez [desarrolloti43]
    * @date 2023-08-15
   */

  obtenerIdOficina(): string {
    let idoficinaJson = JSON.parse(sessionStorage.getItem('usuario')!);
    return idoficinaJson.claveOficina;
  }

  /**
    * openSnackBar: Funcion para limpiar formulario para la busqueda de los talones.
    *
    * @param fecha (string)
    * @return Date
    * @author Oswaldo Ramirez [desarrolloti43]
    * @date 2023-08-15
   */

  openSnackBar(message: string, action: string, tiempo: number): void {
    this.snackBar.open(message, action, {
      duration: tiempo
    });
  }

  /**
    * openDialog: Funcion para limpiar formulario para la busqueda de los talones.
    *
    * @param fecha (string)
    * @return Date
    * @author Oswaldo Ramirez [desarrolloti43]
    * @date 2023-08-15
   */

  openDialog(): void {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = (this.modo === 'agregar') ? '460px' : '550px';
    this.dialog.open(this.dialogTemplate, dialogConfig);
  }
  /**
    * oncloseDialog: Funcion para limpiar formulario para la busqueda de los talones.
    *
    * @param fecha (string)
    * @return Date
    * @author Oswaldo Ramirez [desarrolloti43]
    * @date 2023-08-15
   */

  oncloseDialog(): void {
    this.dialog.closeAll();

  }

  /**
    * validaInformacion: Funcion para limpiar formulario para la busqueda de los talones.
    *
    * @param fecha (string)
    * @return Date
    * @author Oswaldo Ramirez [desarrolloti43]
    * @date 2023-08-16
   */

  validaInformacion(dato: any): boolean {
    return dato !== undefined && dato !== null && dato !== '' && dato !== "Invalid Date" ? true : false;
  }

  /**
    * cargarDatos: Funcion para obtener los datos de la tabla.
    *
    * @param fecha (string)
    * @return Date
    * @author Oswaldo Ramirez [desarrolloti43]
    * @date 2023-08-15
   */

  cargarDatos(mensaje: string) {
    this.isLoading = true;
    if (this.obtenerIdOficina() == '1100') {
      this.fletesService.getFletesOptimo().subscribe(
        (success: any) => {

          this.isLoading = false;
          this.dataSource = new MatTableDataSource<flete_optimo>(success as flete_optimo[]);
          this.dataSource.paginator = this.paginator;
          this.paginator.pageSize = 5;
          this.dataSource.sort = this.tablaFleteOptimoSort;
          this.openSnackBar('' + mensaje, '✅', 3000);
        },
        (error: any) => {
          this.isLoading = false;
          this.openSnackBar('Hubo un error al hacer la consulta.', '⛔', 3000);
        });
    } else {
      this.fletesService.getFletesOptimoOficina(this.obtenerIdOficina()).subscribe(
        (success: any) => {

          this.isLoading = false;
          this.dataSource = new MatTableDataSource<flete_optimo>(success as flete_optimo[]);
          this.dataSource.paginator = this.paginator;
          this.paginator.pageSize = 5;
          this.dataSource.sort = this.tablaFleteOptimoSort;
          this.openSnackBar('' + mensaje, '✅', 3000);
        },
        (error: any) => {
          this.isLoading = false;
          this.openSnackBar('Hubo un error al hacer la consulta.', '⛔', 3000);
        });
    }
  }

  /**
    * onInputSucursales: Funcion para el evento del filtrado en el mat-input zonas.
    *
    * @param fecha (string)
    * @return Date
    * @author Oswaldo Ramirez [desarrolloti43]
    * @date 2023-08-18
   */


  onInputSucursales(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.filteredSucursales = this.filtrarDatosSucursal(inputElement.value);
  }

  /**
    * filtrarDatosSucursal: Funcion de filtrado para mostrar la informacion en el mat-input de los cedis
    *
    * @param fecha (string)
    * @return Date
    * @author Oswaldo Ramirez [desarrolloti43]
    * @date 2023-08-18
   */


  filtrarDatosSucursal(query: string): any[] {
    let filtered: any[] = [];
    if (query) {
      filtered = this.sucursales.filter((sucursal) =>
        sucursal.nombreOficina.toLowerCase().includes( query.toLowerCase())
      );
    } else {
      filtered = this.sucursales;
    }
    return filtered;
  }

  /**
    * displayFn: Funcion para limpiar formulario para la busqueda de los talones.
    *
    * @param fecha (string)
    * @return Date
    * @author Oswaldo Ramirez [desarrolloti43]
    * @date 2023-08-15
   */


  displayFn(sucursal: any): string {
    return sucursal? (this.selectedSatelite = sucursal.idOficina, sucursal.nombreOficina): '';
  }

  /**
    * displayFnZonas: Funcion de filtrado para mostrar la informacion en el mat-input zonas de influencia
    *
    * @param fecha (string)
    * @return Date
    * @author Oswaldo Ramirez [desarrolloti43]
    * @date 2023-08-15
   */


  displayFnZonas(zona: any): string {
    return zona ? ((this.selectedZonasInfluencia = zona.idZona), zona.nombre) : '';
  }

  /**
    * onInputZonas: Funcion para el evento del filtrado en el mat-input zonas
    *
    * @param fecha (string)
    * @return Date
    * @author Oswaldo Ramirez [desarrolloti43]
    * @date 2023-08-18
   */


  onInputZonas(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.filteredZonas = this.filtrarDatosZonasInfluencia(inputElement.value);
  }

  /**
    * filtrarDatosZonasInfluencia: Funcion para obtener el filtrado del mat-input zonas de influencia
    *
    * @param fecha (string)
    * @return Date
    * @author Oswaldo Ramirez [desarrolloti43]
    * @date 2023-08-18
   */


  filtrarDatosZonasInfluencia(query: string): any[] {
    return query? this.zonasInfluencia.filter(zona => zona.nombre.toLowerCase().includes(query.toLowerCase())): this.zonasInfluencia;
  }

  /**
    * toggleCheckbox: Funcion obtener el valor de 1 o 0 del estatus
    *
    * @param fecha (string)
    * @return Date
    * @author Oswaldo Ramirez [desarrolloti43]
    * @date 2023-08-15
   */

  toggleCheckbox() {
    this.estatus = this.estatus === 0 ? 0 : 1;
  }

  /**
    * onKeyPress: Permitir solo teclas numéricas y ciertas teclas especiales (por ejemplo, backspace)
    *
    * @param fecha (string)
    * @return Date
    * @author Oswaldo Ramirez [desarrolloti43]
    * @date 2023-08-18
   */


  onKeyPress(event: KeyboardEvent) {

    const allowedKeys = [8, 37, 39, 46];
    if (
      allowedKeys.indexOf(event.keyCode) === -1 &&
      (event.keyCode < 48 || event.keyCode > 57) && // Dígitos
      (event.key !== ',' && event.key !== '.') // Separador decimal
    ) {
      event.preventDefault();
    }
  }

  /**
    * onInput: Funcion de solo aceptar caracteres numericos.
    *
    * @param fecha (string)
    * @return Date
    * @author Oswaldo Ramirez [desarrolloti43]
    * @date 2023-08-17
   */


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

  /**
    * guardarFlete: Funcion para guardar el nuevo flete optimo
    *
    * @param fecha (string)
    * @return Date
    * @author Oswaldo Ramirez [desarrolloti43]
    * @date 2023-08-17
   */


  guardarFlete() {

    if (typeof this.formGroupFlete.value.idSucursal !== 'object') {
      this.openSnackBar('Tienes que seleccionar un origen.', '⛔', 3000);
    } else if (typeof this.formGroupFlete.value.zona !== 'object') {
      this.openSnackBar('Tienes que seleccionar una zona de influencia.', '⛔', 3000);
    } else {
      const today = new Date();
      const tiempo = moment(today).format('HH:mm:ss');
      const formattedDate = moment(today).format('YYYY-MM-DD');
      const zonaSeleccionado = this.formGroupFlete.value.zona;
      const sucursalSeleccionado = this.formGroupFlete.value.idSucursal;
      const cantidadFlete = this.formGroupFlete.value.flete !== '' ? this.formGroupFlete.value.flete : 'vacio';
      const estatus = this.formGroupFlete.value.estatus === true ? 1 : 0;
      let mensaje = 'Se guardo de manera exitosa!'
      if (cantidadFlete == undefined || cantidadFlete == 0 || cantidadFlete == "vacio") {
        this.openSnackBar('Se requiere ingresar un monto mayor a $0.00', '⛔', 3000);
      } else {
        this.isLoading = true;
        if (this.modo === 'agregar') {
          const agregar = {
            idZona: zonaSeleccionado.idZona,
            idOficina: sucursalSeleccionado.idOficina,
            cantidadFleteOptimo: cantidadFlete,
            estatus: this.estatus,
            idPersonal: this.obtenerIdPersonal(),
            fechaMod: formattedDate,
            horaMod: formattedDate + 'T' + tiempo
          };

          this.fletesService.createFlete(agregar).subscribe(
            (success: any) => {
              this.cargarFletesOptimos();
              this.cargarDatos(mensaje);
              this.isLoading = false;
            },
            (error: any) => {
              this.isLoading = false;
              this.openSnackBar('Hubo un error al guardar', '⛔', 3000);
            });
        } else if (this.modo === 'modificar') {
          mensaje = 'Se actualizo de manera exitosa!'
          this.isLoading = true;
          const modificar = {
            idFleteOptimo: this.idFleteOptimo,
            idOficina: sucursalSeleccionado.id,
            idZona: zonaSeleccionado.id,
            cantidadFleteOptimo: cantidadFlete,
            estatus: estatus,
            idPersonal: this.obtenerIdPersonal(),
            fechaMod: formattedDate,
            horaMod: formattedDate + 'T' + tiempo
          };
          this.fletesService.updateFlete(modificar).subscribe(
            async (success: any) => {
              if (this.circuitosActuales.length == 0) {
                for (let i = 0; i < this._value.length; i++) {
                  let circuito = {
                    idFleteOptimo: this.idFleteOptimo,
                    idCircuito: this._value[i],
                    estatus: 1,
                    idPersonal: this.obtenerIdPersonal(),
                    fechaMod: formattedDate,
                    horaMod: tiempo
                  }
                  await this.fletesService.createCircuito(circuito).toPromise();
                }
                this.isLoading = false;
                this.cargarFletesOptimos();
                this.cargarDatos(mensaje);
              }
              else if (this._value.length == this.circuitosActuales.length) {
                for (let i = 0; i < this.circuitosActuales.length; i++) {
                  let circuito = {
                    idCircuitoFleteOptimo: this.circuitosActuales[i].idCircuitoFleteOptimo,
                    idFleteOptimo: this.idFleteOptimo,
                    idCircuito: this.circuitosActuales[i].idCircuito,
                    estatus: 1,
                    idPersonal: this.obtenerIdPersonal(),
                    fechaMod: formattedDate,
                    horaMod: tiempo
                  }
                  try {
                    await this.fletesService.updateCircuito(circuito).toPromise();
                  } catch (error) {
                    this.isLoading = false;
                    this.openSnackBar('Hubo un error al guardar los circuitos.', '⛔', 3000);
                  }
                }
                this.cargarFletesOptimos();
                this.cargarDatos(mensaje);
                this.isLoading = false;

              } else if (this._value.length > this.circuitosActuales.length) {
                try {
                  for (let i = 0; i < this.circuitosActuales.length; i++) {
                    let circuito = {
                      idCircuitoFleteOptimo: this.circuitosActuales[i].idCircuitoFleteOptimo,
                      idFleteOptimo: this.idFleteOptimo,
                      idCircuito: this._value[i],
                      estatus: 1,
                      idPersonal: this.obtenerIdPersonal(),
                      fechaMod: formattedDate,
                      horaMod: tiempo
                    }

                    await this.fletesService.updateCircuito(circuito).toPromise();
                  }
                  for (let i = 0; i < this._value.length - this.circuitosActuales.length; i++) {
                    let crearCircuito = {
                      idFleteOptimo: this.idFleteOptimo,
                      idCircuito: this._value[i + this.circuitosActuales.length],
                      estatus: 1,
                      idPersonal: this.obtenerIdPersonal(),
                      fechaMod: formattedDate,
                      horaMod: tiempo
                    }
                    await this.fletesService.createCircuito(crearCircuito).toPromise();
                  }
                  this.cargarFletesOptimos();
                  this.cargarDatos(mensaje);
                  this.isLoading = false;
                } catch (error) {
                  this.openSnackBar('Hubo un error al guardar los circuitos.', '⛔', 3000);
                }
              } else if (this._value.length < this.circuitosActuales.length) {
                try {
                  for (let i = 0; i < this.circuitosActuales.length; i++) {
                    const estatus = (this.circuitosActuales.length - 1) === i ? 0 : 1;
                    this.circuitosActuales[i].idCircuitoFleteOptimo;
                    let circuito = {
                      idCircuitoFleteOptimo: this.circuitosActuales[i].idCircuitoFleteOptimo,
                      idFleteOptimo: this.idFleteOptimo,
                      idCircuito: (this.circuitosActuales.length - 1) === i ? this.circuitosActuales[i].idCircuito : this._value[i],
                      estatus: estatus,
                      idPersonal: this.obtenerIdPersonal(),
                      fechaMod: formattedDate,
                      horaMod: tiempo
                    }
                    await this.fletesService.updateCircuito(circuito).toPromise();
                  }
                  this.cargarFletesOptimos();
                  this.cargarDatos(mensaje);
                  this.isLoading = false;
                } catch (error) {
                }
              }
            },
            (error: any) => {
              this.isLoading = false;
              this.openSnackBar('Hubo un error al guardar', '⛔', 3000);
            });
        }
        this.oncloseDialog();
      }
    }

  }
  /**
    * abrirModalAgregar: Funcion declarar y abrir el modal para agregar el flete optimo
    *
    * @param fecha (string)
    * @return Date
    * @author Oswaldo Ramirez [desarrolloti43]
    * @date 2023-08-16
   */


  abrirModalAgregar() {
    this.modo = 'agregar';
    this.formGroupFlete.get('idSucursal').setValue();
    this.formGroupFlete.get('zona').setValue();
    this.formGroupFlete.get('flete').setValue();
    this.placeholderSucursal = '';
    this.estatus = 1;
    this.isDivBlocked = true;
    this.ngSelect = false;
    this.formGroupFlete.controls['estatus'].setValue(true);
    this.openDialog();
  }

  /**
    * abrirModalModificar: Funcion declarar y abrir el modal para modificar el flete optimo
    *
    * @param fecha (string)
    * @return Date
    * @author Oswaldo Ramirez [desarrolloti43]
    * @date 2023-08-16
   */


  abrirModalModificar(idFlete: number) {
    this.isLoading = true;
    this.idFleteOptimo = idFlete;
    this.modo = 'modificar';
    this.fletesService.getByFletesOptimo(idFlete).subscribe(response => {
      this.fletesService.getByCircuito(response.idFleteOptimo).subscribe(circuito => {
        const rutas: string[] = [];
        if (circuito.length > 0) {
          this._value = [];
          circuito.forEach(circuito => {
            rutas.push(circuito.idCircuito.toString());
          });
          this.circuitosActuales = circuito;
          this._value = rutas;
        } else {
          this._value = [];
        }
        this.formGroupFlete.controls['estatus'].setValue(response.estatus === 1 ? true : false);
        const oficina = { id: response.idOficina, nombreOficina: response.nombreOficina.trim() };
        const zona = { id: response.idZona, nombre: response.nombreZona.trim() }
        this.formGroupFlete.get('zona').setValue(zona);
        this.formGroupFlete.get('idSucursal').setValue(oficina);
        this.formGroupFlete.get('flete').setValue(response.cantidadFleteOptimo);
        this.openDialog();
        this.isLoading = false;
      }, (error: any) => {
        this._value = [];
        this.circuitosActuales = [];
        this.formGroupFlete.controls['estatus'].setValue(response.estatus === 1 ? true : false);
        const oficina = { id: response.idOficina, nombreOficina: response.nombreOficina.trim() };
        const zona = { id: response.idZona, nombre: response.nombreZona.trim() }
        this.formGroupFlete.get('zona').setValue(zona);
        this.formGroupFlete.get('idSucursal').setValue(oficina);
        this.formGroupFlete.get('flete').setValue(response.cantidadFleteOptimo);
        this.isLoading = false;
        this.openDialog();
      })

    }, (error: any) => {
      this.isLoading = false;
      this.openSnackBar('Hubo un error al consultar el flete optimo', '⛔', 3000);
    });
    this.isDisabled = false;
    this.isDivBlocked = false
    this.ngSelect = true;
  }

  /**
    * obtenerIdPersonal: Funcion para obtener el idPersonal del usuario.
    *
    * @param fecha (string)
    * @return Date
    * @author Oswaldo Ramirez [desarrolloti43]
    * @date 2023-08-16
   */


  obtenerIdPersonal(): string {
    let usuarioJson = JSON.parse(sessionStorage.getItem('usuario')!);
    return usuarioJson.id;
  }
  /**
    * applyFilter: Funcion para aplicar el filtro en la tabla de pleaneacion principal
    *
    * @param fecha (string)
    * @return Date
    * @author Oswaldo Ramirez [desarrolloti43]
    * @date 2023-08-16
   */


  applyFilter() {
    const filters = {
      nombreOficina: this.origenFiltro.value,
      nombreZona: this.zonaInfluenciaFiltro.value,
      cantidadFleteOptimo: this.FleteFiltro.value,
      estatus: this.estatusFiltro.value,
    };

    this.dataSource.filterPredicate = (data: flete_optimo, filter: string) => {
      const filtersObj = JSON.parse(filter);
      const estatusFlete = data.estatus === 1 ? 'Activado' : 'Inactivo';
      const nombreOficinaMatch = data.nombreOficina?.toLowerCase().includes(filtersObj.nombreOficina?.toLowerCase() || '');
      const nombreZonaMatch = data.nombreZona?.toLowerCase().includes(filtersObj.nombreZona?.toLowerCase() || '');
      const estatusFleteMatch = estatusFlete?.toString().toLowerCase().includes(filtersObj.estatus?.toLowerCase() || '');
      const cantidadFleteOptimoMatch = data.cantidadFleteOptimo?.toString().toLowerCase().includes(filtersObj.cantidadFleteOptimo?.toLowerCase() || '');
      return nombreOficinaMatch && nombreZonaMatch && estatusFleteMatch && cantidadFleteOptimoMatch;
    };
    this.dataSource.filter = JSON.stringify(filters);
  }
  /**
     * applyFilter: Funcion para aplicar el filtro en la tabla de pleaneacion principal
     *
     * @param fecha (string)
     * @return Date
     * @author Oswaldo Ramirez [desarrolloti43]
     * @date 2023-08-21
    */
  verDetalles(flete: any) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '40%';
    this.isLoading = true;
    this.fleteDetalles = flete;
    this.listCircuitos = [];
    this.fletesService.getByCircuito(flete.idFleteOptimo).subscribe(circuito => {
      this.isLoading = false;
      this.listCircuitos = circuito;
      this.dialog.open(this.dialogCircuitos, dialogConfig);
    },
      (error) => {
        this.isLoading = false;
        this.dialog.open(this.dialogCircuitos, dialogConfig);
      }
    );

  }

}
