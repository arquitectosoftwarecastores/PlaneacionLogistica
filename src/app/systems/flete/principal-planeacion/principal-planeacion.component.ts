
import { AfterViewInit, Component, TemplateRef, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTable, MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import {
  CdkDragDrop,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AuthService } from 'src/app/authentication/login/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { cedis } from 'src/app/interfaces/oficina';
import { oficinasService } from 'src/app/services/oficinas.service';
import { CustomPaginator } from 'src/app/shared/paginator/custompaginator';
import { sateliteService } from '../../../services/satelite.service';
import { forkJoin } from 'rxjs';
import { zonasInfluencia } from 'src/app/interfaces/zonasInfluencia';
import { tipoVenta } from 'src/app/interfaces/tipoVenta';
import { fletesService } from 'src/app/services/flete.service';
import { ubicacionTalon } from 'src/app/interfaces/ubicacionTalon';
import { DatosTalon } from 'src/app/interfaces/datosTalon';
import { consultaCorteService } from 'src/app/services/consultaCorte';
import * as pako from 'pako';


@Component({
  selector: 'app-principal-planeacion',
  templateUrl: './principal-planeacion.component.html',
  styleUrls: ['./principal-planeacion.component.css'],
  providers: [
    { provide: MatPaginatorIntl, useValue: CustomPaginator() }
  ]
})
export class PrincipalPlaneacionComponent {
  minDate: Date = new Date();

  // Calcula la fecha máxima (7 días desde hoy)
  maxDate: Date = new Date();

  public permisoAInsertarAgregar: any = 0;
  private permisoBConsultar: any = 0;
  private permisoCEliminar: any = 0;
  public permisoDActualizar: any = 0;
  private permisoEAutorizar: any = 0;
  private permisoFRechazar: any = 0;
  private permisoHDescargar: any = 0;
  private permisoIImprimir: any = 0;
  public formGroupFiltro: any;
  public formGroupCorte: any;
  private oficinaResponse: any;
  public dataSource = new MatTableDataSource<DatosTalon>();
  public sumatoriaTabla = new MatTableDataSource();


  columnasMostradas: string[] = ['index', 'claTalon', 'tipoTalon', 'flete', 'cdp', 'bulto', 'volumen', 'queContiene', 'documenta', 'origen', 'tipo', 'venta',
    'destino', 'tipoGuia', 'noEconomico'];
  displayedColumns: string[] = this.columnasMostradas;
  venta = new FormControl();
  tipo = new FormControl();
  ventaList: tipoVenta[] = [];
  tipoList: ubicacionTalon[] = [];
  fleteFilter = new FormControl();
  cdpFilter = new FormControl();

  numeroTalonFiltro = new FormControl();
  tipoTalonFiltro = new FormControl();
  fleteFiltro = new FormControl();
  cdpFiltro = new FormControl();
  bultosFiltro = new FormControl();
  valumenFiltro = new FormControl();
  contieneFiltro = new FormControl();
  DocumentaFiltro = new FormControl();
  origenFiltro = new FormControl();
  tipoFiltro = new FormControl();
  ventaFiltro = new FormControl();
  destinoFiltro = new FormControl();
  tipoGuiaFiltro = new FormControl();
  noEconomicoFiltro = new FormControl();

  filteredSucursales: any[] = [];
  filteredZonas: any[] = [];
  cedis: cedis[] = [];
  zonasInfluencia: zonasInfluencia[] = [];
  selectedSatelite: any;
  selectedZonasInfluencia: any;
  placeholderSucursal = 'Zona';
  inputValue!: number;
  inputValueLocal = '';
  placeholderText = '';
  placeholderTextLocal = '';
  disabledCedis = false;
  inputCedis = true;
  idCedisLocal!: number;
  mostrarColumna!: boolean;
  mostrarBoton = false;
  isLoading: boolean = true;
  selectedCedis: string | null = null;
  selectedZona: string | null = null;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('dialogCorte') dialogCorte!: TemplateRef<any>;
  @ViewChild('dialogRoles') dialogRoles!: TemplateRef<any>;
  @ViewChild('tablaPlaneacionSort', { static: false }) set tablaPlaneacionSort(tablaPlaneacionSort: MatSort) {
    if (this.validaInformacion(tablaPlaneacionSort)) this.dataSource.sort = tablaPlaneacionSort;
  }
  @ViewChild('sumatoria', { static: false }) set sumatoria(sumatoria: MatSort) {
    if (this.validaInformacion(sumatoria)) this.sumatoriaTabla.sort = sumatoria;
  }

  Flete: any;
  dateFilter: any;
  constructor(public dialog: MatDialog, private authService: AuthService, public snackBar: MatSnackBar, private router: Router,
    private formBuilder: FormBuilder, private oficinaService: oficinasService, private consultaCorteService: consultaCorteService,
    private oficinasService: oficinasService, private fleteService: fletesService) {

  }

  ngOnInit(): void {
    this.tipo.setValue([]);
    this.venta.setValue([]);
    const SISTEMA: number = 14;
    const MODULO: number = 78;
    this.mostrarColumna = true;
    this.formGroupFiltro = new FormGroup({
      idCedis: new FormControl(''),
      idCedisLocal: new FormControl(''),
      zona: new FormControl(''),
      fechaInicio: new FormControl(null),
      fechafin: new FormControl(null),
      tipo: new FormControl(''),
      venta: new FormControl('')
    });

    this.formGroupFiltro = this.formBuilder.group({
      idCedis: ['', Validators.compose([Validators.required])],
      zona: ['', Validators.compose([Validators.required])],
      idCedisLocal: [{ value: ' ', disabled: true }, Validators.compose([Validators.required])],
      venta: [null, Validators.compose([Validators.required])],
      tipo: [null, Validators.compose([Validators.required])],
      fechaInicio: [{ value: ' ', disabled: true }, Validators.compose([Validators.required])],
      fechaFin: [{ value: ' ', disabled: true }, Validators.compose([Validators.required])]
    });

    this.formGroupCorte = new FormGroup({
      descripcionCorte: new FormControl()
    });

    this.formGroupCorte = this.formBuilder.group({
      descripcionCorte: ['', Validators.compose([Validators.required])],
    });

    this.dateFilter = (date: Date | null): boolean => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 2);

      // Permite las fechas dentro del rango entre ayer y hoy
      return date! >= yesterday && date! <= today;
    }


    this.fechaInicio();
    let oficinaUsuario = this.authService.getOficina();
    if (oficinaUsuario == '1100') {
      this.inputValue = Number("1100");
      this.placeholderText = "CORPORATIVO";
      this.inputCedis = true;
    } else {
      this.inputCedis = false;
      console.log(oficinaUsuario);
      this.oficinasService.getOficina(oficinaUsuario).subscribe(response => {
        console.log(response);
        this.inputValueLocal = response.plaza.toLocaleUpperCase();
        console.log(this.inputValueLocal);
      }, (error: any) => {
        this.openSnackBar('Hubo un error al consultar el satelite', '⛔', 3000);
      });
    }

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
    this.isLoading = true;
    forkJoin([this.oficinaService.getOficinas(), this.oficinaService.getZonasInfluencia(), this.fleteService.getTipoVenta(), this.fleteService.getUbicacionTalon()]).subscribe(
      ([cedis, zonasInfluencia, venta, ubicacionTalon]) => {
        this.cedis = cedis;
        this.zonasInfluencia = zonasInfluencia;
        this.ventaList = venta;
        this.tipoList = ubicacionTalon;
        this.isLoading = false;
      },
      (error) => {
        this.isLoading = false;
        this.openSnackBar('Hubo un error al consultar', '⛔', 3000);
      }
    );


  }
  ventasSeleccionados = false;
  tiposSeleccionados = false;

  seleccionarTodosVenta() {
    this.ventasSeleccionados = !this.ventasSeleccionados;
    if (this.ventasSeleccionados) {
      this.venta.setValue([...this.ventaList]);
      /*
      if(this.tipo.value.length!=2){
        this.tipoList = this.tipoList.filter((item) => item.nombre !== 'Virtual');
      }
      */
      this.fleteService.getUbicacionTalon().subscribe(
        (tipo) => {

          const virtual = tipo.find(item => item.nombre === 'Virtual');
          const tipoExiste = this.tipoList.some((venta: { nombre: string; }) => venta.nombre === 'Virtual')
          if (virtual) {
            if (tipoExiste == false) {
              this.tipoList.push(virtual!);
            }
          }
        },
        (error) => {
          this.openSnackBar('Hubo un error al consultar', '⛔', 3000);
        })
    } else {
      this.venta.setValue([]);
      this.fleteService.getUbicacionTalon().subscribe(
        (tipo) => {

          const virtual = tipo.find(item => item.nombre === 'Virtual');
          const tipoExiste = this.tipoList.some((venta: { nombre: string; }) => venta.nombre === 'Virtual')
          if (virtual) {
            if (tipoExiste == false) {
              this.tipoList.push(virtual!);
            }
          }
        },
        (error) => {
          this.openSnackBar('Hubo un error al consultar', '⛔', 3000);
        })
    }
  }



  seleccionarTodosTipo() {
    if (this.tiposSeleccionados) {
      this.tipo.setValue([]);
    } else {
      this.tipo.setValue(this.tipoList);
    }

    const isPisoSelected = this.tipo.value.some((tipo: { nombre: string; }) => tipo.nombre === 'Piso');
    const isPisoVirtual = this.tipo.value.some((tipo: { nombre: string; }) => tipo.nombre === 'Virtual');
    if (isPisoSelected == true || isPisoVirtual == true) {
      if (isPisoVirtual && isPisoSelected == false) {
        this.ventaList = this.ventaList.filter((item) => item.nombre !== 'Local');
      } else {
        this.fleteService.getTipoVenta().subscribe(
          (venta) => {
            console.log(this.ventaList.some((item) => item.nombre === 'Local'));
            if (this.ventaList.some((item) => item.nombre === 'Local') != true) {
              const localVenta = venta.find(item => item.nombre === 'Local');
              if (localVenta) {
                this.ventaList.push(localVenta);
              }
            }
          },
          (error) => {
            this.openSnackBar('Hubo un error al consultar', '⛔', 3000);
          }
        );
      }
    }
    this.tiposSeleccionados = !this.tiposSeleccionados;
  }
  openSnackBar(message: string, action: string, tiempo: number): void {
    this.snackBar.open(message, action, {
      duration: tiempo
    });
  }

  filterDates(date: Date): boolean {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    return date <= today && date >= yesterday;
  }

  fechaInicio() {
    document.addEventListener('DOMContentLoaded', () => {
      // Obtener el elemento del input de fecha
      const fechaInput = document.getElementById('fechaInput');

      // Obtener la fecha actual
      const fechaHoy = new Date();
      const fechaHoyFormatted = this.formatDate(fechaHoy);

      // Obtener la fecha de ayer
      const fechaAyer = new Date(fechaHoy);
      fechaAyer.setDate(fechaHoy.getDate() - 1);
      const fechaAyerFormatted = this.formatDate(fechaAyer);

      // Establecer el evento oninput para deshabilitar fechas no deseadas
      fechaInput!.addEventListener('input', () => {
        const selectedDate = new Date((fechaInput as HTMLInputElement).value);
        const selectedDateFormatted = this.formatDate(selectedDate);

        // Deshabilitar las fechas que no son hoy ni ayer
        if (selectedDateFormatted !== fechaHoyFormatted && selectedDateFormatted !== fechaAyerFormatted) {
          (fechaInput as HTMLInputElement).value = '';
        }
      });
    });
  }

  onInputSucursales(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const query = inputElement.value;
    this.filteredSucursales = this.filtrarDatosCedis(query);
  }
  onInputZonas(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    const query = inputElement.value;
    this.filteredZonas = this.filtrarDatosZonasInfluencia(query);
  }


  formatDate(date: any) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  openDialog(): void {
    this.dialog.open(this.dialogCorte);
  }
  openDialogPermisos(): void {
    this.dialog.open(this.dialogRoles);
  }
  oncloseDialog(): void {
    this.dialog.closeAll();

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
  getColumnIndex(columnName: string): number {
    return this.displayedColumns.indexOf(columnName);
  }

  displayFn(sucursal: any): string {
    this.selectedSatelite = sucursal?.id;
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
  filtrarDatosCedis(query: string): any[] {
    let filtered: any[] = [];
    if (query) {
      const lowercaseQuery = query.toLowerCase();
      filtered = this.cedis.filter((sucursal) =>
        sucursal.nombre.toLowerCase().includes(lowercaseQuery)
      );
    } else {
      filtered = this.cedis;
    }
    return filtered;
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

  onFechaInicioChange(event: any) {
    return event.value;
  }
  onFechaFinChange(event: any) {
    return event.value;
  }

  buscar() {

    const fechaInicio = this.formGroupFiltro.get('fechaInicio').value;
    const fechaFinal = this.formGroupFiltro.get('fechaFin').value;
    const zonaInfluencia = this.formGroupFiltro.get('zona').value;
    const cedisOrigen = this.formGroupFiltro.get('idCedis').value;
    let tabla1 = new MatTableDataSource<DatosTalon>()
    let tabla2 = new MatTableDataSource<DatosTalon>()
    let tabla3 = new MatTableDataSource<DatosTalon>()
    let local = 0;
    let agencia = 0;
    let satelite = 0;

    let inicio = new Date(fechaInicio);
    let año = inicio.getFullYear();
    let mes = String(inicio.getMonth() + 1).padStart(2, '0');
    let dia = String(inicio.getDate()).padStart(2, '0');

    const columnasOcultas = ['tipoGuia', 'noEconomico'];

    const fechaIniciaFormato = `${año}-${mes}-${dia}`;
    let fin = new Date(fechaFinal);
    año = fin.getFullYear();
    mes = String(fin.getMonth() + 1).padStart(2, '0');
    dia = String(fin.getDate()).padStart(2, '0');

    const fechaFinalFormato = `${año}-${mes}-${dia}`;
    const idCedisInput = this.formGroupFiltro.get('idCedis').value.nombre;
    if (this.venta.value.some((v: tipoVenta) => v.nombre === 'Local')) {
      local = 1;
    }
    if (this.venta.value.some((v: tipoVenta) => v.nombre === 'Agencia')) {
      agencia = 1;
    }
    if (this.venta.value.some((v: tipoVenta) => v.nombre === 'Satélite')) {
      satelite = 1;
    }
    console.log(cedisOrigen.id);
    let oficina = this.obtenerIdOficina() === '1100' ? cedisOrigen.id : this.obtenerIdOficina();

    if (this.obtenerIdOficina().includes('1100') && cedisOrigen.id == null) {
      this.openSnackBar('Debes de seleccionar una oficina', '⛔', 3000);
    } else if (fechaIniciaFormato == null || fechaIniciaFormato == 'NaN-NaN-NaN') {
      this.openSnackBar('Debes de seleccionar una fecha de inicio', '⛔', 3000);
    } else if (fechaFinalFormato == null || fechaFinalFormato == 'NaN-NaN-NaN') {
      this.openSnackBar('Debes de seleccionar una fecha final', '⛔', 3000);
    } else if (fechaIniciaFormato > fechaFinalFormato) {
      this.openSnackBar('La fecha inicio no puede ser mayor a fecha fin', '⛔', 3000);
    } else if (this.venta.value == null) {
      this.openSnackBar('Debes de seleccionar minimo un tipo venta', '⛔', 3000);
    } else if (this.tipo.value == null) {
      this.openSnackBar('Debes de seleccionar el tipo de la ubicacion del talon', '⛔', 3000);
    } else if (this.tipo.value.length == 2 && this.venta.value.length == 3) {
      this.isLoading = true;

      let datosConsultaPisoAgenciaSatelite = {
        "agencia": 1,
        "satelite": 1,
        "fechaInicio": fechaIniciaFormato,
        "fechaFin": fechaFinalFormato,
        "origen": Number(oficina),
        "nombreOrigen": "" + idCedisInput,
        "zonaDeInfluencia": zonaInfluencia.idZona
      }

      let datosConsultaPisoLocal = {
        "agencia": 0,
        "satelite": 0,
        "fechaInicio": fechaIniciaFormato,
        "fechaFin": fechaFinalFormato,
        "origen": Number(oficina),
        "nombreOrigen": "" + idCedisInput,
        "zonaDeInfluencia": zonaInfluencia.idZona
      }
      let datosConsultaVirtual = {
        "agencia": 1,
        "satelite": 1,
        "fechaInicio": fechaIniciaFormato,
        "fechaFin": fechaFinalFormato,
        "origen": Number(oficina),
        "nombreOrigen": "" + idCedisInput,
        "zonaDeInfluencia": zonaInfluencia.idZona
      }

      forkJoin([this.fleteService.getPisoAgenciaSatelite(datosConsultaPisoAgenciaSatelite), this.fleteService.getPisoLocal(datosConsultaPisoLocal),
      this.fleteService.getVirtualAgenciaSatelite(datosConsultaVirtual)]).subscribe(([piso, local, virtual]) => {
        tabla1 = new MatTableDataSource<DatosTalon>(piso as DatosTalon[]);
        tabla2 = new MatTableDataSource<DatosTalon>(local as DatosTalon[]);
        tabla3 = new MatTableDataSource<DatosTalon>(virtual as DatosTalon[]);
        this.dataSource = new MatTableDataSource([...tabla1.data, ...tabla2.data, ...tabla3.data]);
        this.dataSource.paginator = this.paginator;
        this.paginator.pageSize = 5;
        this.dataSource.sort = this.tablaPlaneacionSort;

        let mensajeConsulta = '';
        if (this.dataSource.data.length > 0) {
          mensajeConsulta = '.';
          this.mostrarBoton = true;
        } else {
          this.mostrarBoton = false;
          mensajeConsulta = ' pero no se encontraron registros.';
        }
        this.openSnackBar('Se realizo la consulta de manera exitosa' + mensajeConsulta, '✅', 3000);
        this.isLoading = false;
      }),
      (error: any) => {
        this.mostrarBoton = false;
        this.isLoading = false;
        this.openSnackBar('Hubo un error al hacer la consulta.', '⛔', 3000);
      };
      columnasOcultas.forEach((columna) => {
        if (!this.displayedColumns.includes(columna)) {
          this.displayedColumns.push(columna);
        }
      });
    } else {
      this.isLoading = true;
      let datosConsulta = {
        "agencia": agencia,
        "satelite": satelite,
        "fechaInicio": fechaIniciaFormato,
        "fechaFin": fechaFinalFormato,
        "origen": Number(oficina),
        "nombreOrigen": "" + idCedisInput,
        "zonaDeInfluencia": zonaInfluencia?.idZona
      }
      if (this.tipo.value.some((u: ubicacionTalon) => u.nombre === 'Piso')) {
        if (satelite == 1 || agencia == 1) {
          if(this.tipo.value.some((u: ubicacionTalon) => u.nombre === 'Virtual')){
            forkJoin([this.fleteService.getPisoAgenciaSatelite(datosConsulta),
              this.fleteService.getVirtualAgenciaSatelite(datosConsulta)]).subscribe(([piso, virtual]) => {
                tabla1 = new MatTableDataSource<DatosTalon>(piso as DatosTalon[]);
                tabla3 = new MatTableDataSource<DatosTalon>(virtual as DatosTalon[]);
                this.dataSource = new MatTableDataSource([...tabla1.data, ...tabla2.data, ...tabla3.data]);
                this.dataSource.paginator = this.paginator;
                this.paginator.pageSize = 5;
                this.dataSource.sort = this.tablaPlaneacionSort;

                let mensajeConsulta = '';
                if (this.dataSource.data.length > 0) {
                  mensajeConsulta = '.';
                  this.mostrarBoton = true;
                } else {
                  this.mostrarBoton = false;
                  mensajeConsulta = ' pero no se encontraron registros.';
                }
                this.openSnackBar('Se realizo la consulta de manera exitosa' + mensajeConsulta, '✅', 3000);
                this.isLoading = false;
              }),
              (error: any) => {
                this.mostrarBoton = false;
                this.isLoading = false;
                this.openSnackBar('Hubo un error al hacer la consulta.', '⛔', 3000);
              }
              local=0;
              columnasOcultas.forEach((columna) => {
                if (!this.displayedColumns.includes(columna)) {
                  this.displayedColumns.push(columna);
                }
              });
          }else{
            this.fleteService.getPisoAgenciaSatelite(datosConsulta).subscribe(
              (success: any) => {
                console.log(success);
                tabla1 = new MatTableDataSource<DatosTalon>(success as DatosTalon[]);
                this.dataSource = new MatTableDataSource([...tabla1.data, ...tabla2.data, ...tabla3.data]);
                this.dataSource.paginator = this.paginator;
                this.paginator.pageSize = 5;
                this.dataSource.sort = this.tablaPlaneacionSort;
                if (local != 1) {
                  let mensajeConsulta = '';
                  if (this.dataSource.data.length > 0) {
                    this.mostrarBoton = true;
                    mensajeConsulta = '.';
                  } else {
                    this.mostrarBoton = false;
                    mensajeConsulta = ' pero no se encontraron registros.';
                  }
                  this.openSnackBar('Se realizo la consulta de manera exitosa' + mensajeConsulta, '✅', 3000);
                  this.isLoading = false;
                }
              },
              (error: any) => {
                this.mostrarBoton = false;
                this.isLoading = false;
                this.openSnackBar('Hubo un error al hcaer la consulta.', '⛔', 3000);
              });
          }

        }
        if (local == 1) {

          datosConsulta = {
            "agencia": 0,
            "satelite": 0,
            "fechaInicio": fechaIniciaFormato,
            "fechaFin": fechaFinalFormato,
            "origen": Number(oficina),
            "nombreOrigen": "" + idCedisInput,
            "zonaDeInfluencia": zonaInfluencia.idZona
          }
          this.fleteService.getPisoLocal(datosConsulta).subscribe(
            (success: any) => {
              tabla2 = new MatTableDataSource<DatosTalon>(success as DatosTalon[]);
              this.dataSource = new MatTableDataSource([...tabla1.data, ...tabla2.data, ...tabla3.data]);
              console.log(this.dataSource);
              this.dataSource.paginator = this.paginator;
              this.paginator.pageSize = 5;
              this.dataSource.sort = this.tablaPlaneacionSort;
              this.isLoading = false;
              let mensajeConsulta = '';
              if (this.dataSource.data.length > 0) {
                this.mostrarBoton = true;
                mensajeConsulta = '.';
              } else {
                this.mostrarBoton = false;
                this.isLoading = false;
                mensajeConsulta = ' pero no se encontraron registros.';
              }
              this.openSnackBar('Se realizo la consulta de manera exitosa' + mensajeConsulta, '✅', 3000);
            },
            (error: any) => {
              this.mostrarBoton = false;
              this.isLoading = false;
              this.openSnackBar('Hubo un error al hacer la consulta.', '⛔', 3000);
            });
            const columnas=this.columnasMostradas;
            columnasOcultas.forEach((columna) => {
              const indice = columnas.indexOf(columna);
              if (indice !== -1) {
                columnas.splice(indice, 1);
              }
            });
            this.displayedColumns = columnas;
        }





      } else if (this.tipo.value.some((u: ubicacionTalon) => u.nombre === 'Virtual') || (satelite == 1 || agencia == 1)) {

        columnasOcultas.forEach((columna) => {
          if (!this.displayedColumns.includes(columna)) {
            this.displayedColumns.push(columna);
          }
        });
        this.displayedColumns = this.columnasMostradas;
        this.fleteService.getVirtualAgenciaSatelite(datosConsulta).subscribe(
          (success: any) => {
            console.log(success);
            this.dataSource = new MatTableDataSource<DatosTalon>(success as DatosTalon[]);
            console.log(this.dataSource);
            this.dataSource.paginator = this.paginator;
            this.paginator.pageSize = 5;
            this.dataSource.sort = this.tablaPlaneacionSort;
            this.isLoading = false;
            let mensajeConsulta = '';
            if (this.dataSource.data.length > 0) {
              this.mostrarBoton = true;
              mensajeConsulta = '.';
            } else {
              this.mostrarBoton = false;
              mensajeConsulta = ' pero no se encontraron registros.';
            }
            this.openSnackBar('Se realizo la consulta de manera exitosa' + mensajeConsulta, '✅', 3000);
          },
          (error: any) => {
            this.isLoading = false;
            this.openSnackBar('Hubo un error al hcaer la consulta.', '⛔', 3000);
          });
      }
    }
  }

  calcularSumatoria(columna: keyof DatosTalon): number {
    const sum = this.dataSource.filteredData.slice().reduce((sum, currentRow) => {
      const value = currentRow[columna];
      return typeof value === 'number' ? sum + value : sum;
    }, 0);

    return parseFloat(sum.toFixed(2));
  }

  validaInformacion(dato: any): boolean {
    if (dato != undefined && dato != null && dato != '' && dato != "Invalid Date") {
      return true;
    }
    else {
      return false;
    }
  }

  guardarCorte() {
    if (this.dataSource.data.length <= 0) {
      this.openSnackBar('No puedes agregar un corte sin tener talones en la tabla.', '⛔', 3000);
    } else {

      const today = new Date();
      const year = today.getFullYear();
      const month = ("0" + (today.getMonth() + 1)).slice(-2);
      const day = ("0" + today.getDate()).slice(-2);
      const horas = today.getHours();
      const minutos = today.getMinutes();
      const segundos = today.getSeconds();
      const tiempo = `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}:${segundos.toString().padStart(2, '0')}`;
      const formattedDate = `${year}-${month}-${day}`;

      const cedisOrigen = this.formGroupFiltro.get('idCedis').value;
      const accion = this.formGroupCorte.get('descripcionCorte').value;
      //
      const jsonData = JSON.stringify(this.dataSource.filteredData.slice());
      const compressedData = pako.deflate(jsonData, { level: 9 });
      const numberArray = Array.from(compressedData); // Convert Uint8Array to an array of numbers
      const encodedData = btoa(String.fromCharCode.apply(null, numberArray));
      console.log("base 64");
      console.log(encodedData);
      const idTipoVentaValues = this.venta.value.map((item: { idTipoVenta: number; }) => item.idTipoVenta);
      idTipoVentaValues.sort((a: number, b: number) => a - b);
      const idTipoVentaString = idTipoVentaValues.join(',');

      let oficina = this.obtenerIdOficina() === '1100' ? cedisOrigen.id : this.obtenerIdOficina();

      this.oncloseDialog();

      const idUbicacionTalonArray = this.tipo.value.map((item: { idUbicacionTalon: any; }) => item.idUbicacionTalon);
      idUbicacionTalonArray.sort((a: number, b: number) => a - b);
      const idUbicacionTalonString = idUbicacionTalonArray.join(',');

      const corte = {
        "idOficina": oficina,
        "tipoCorte": "" + idUbicacionTalonString,
        "tipoVenta": "" + idTipoVentaString,
        "accion": accion,
        "descripcionTabla": "" + encodedData,
        "estatus": 1,
        "idPersonal": this.obtenerIdPersonal(),
        "fechaMod": formattedDate,
        "horaMod": tiempo
      }
      console.log(corte);
      this.consultaCorteService.setCorte(corte).subscribe(
        (success: any) => {
          this.openSnackBar('Se guardo de manera exitosa!', '✅', 3000);
          this.mostrarBoton = false;
        },
        (error: any) => {
          this.openSnackBar('Hubo un error al guardar', '⛔', 3000);
        });

    }

  }

  obtenerIdPersonal(): string {
    let usuarioJson = JSON.parse(sessionStorage.getItem('usuario')!);
    return usuarioJson.id;
  }

  obtenerIdOficina(): string {
    let idoficinaJson = JSON.parse(sessionStorage.getItem('usuario')!);
    return idoficinaJson.claveOficina;
  }

  bloquearOpcionPiso() {
    const isPisoSelected = this.tipo.value.some((tipo: { nombre: string; }) => tipo.nombre === 'Piso');
    const isPisoVirtual = this.tipo.value.some((tipo: { nombre: string; }) => tipo.nombre === 'Virtual');
    if (isPisoSelected == true || isPisoVirtual == true) {
      if (isPisoSelected == true && isPisoVirtual == true) {
        this.tiposSeleccionados = true;
      } else {
        this.tiposSeleccionados = false;
      }
      console.log(isPisoVirtual);

      if (isPisoVirtual && isPisoSelected == false) {
        this.ventaList = this.ventaList.filter((item) => item.nombre !== 'Local');
      } else {
        this.fleteService.getTipoVenta().subscribe(
          (venta) => {
            const localVenta = venta.find(item => item.nombre === 'Local');
            const ventaExiste = this.ventaList.some((venta: { nombre: string; }) => venta.nombre === 'Local')
            if (localVenta) {
              if (ventaExiste == false) {
                this.ventaList.push(localVenta);
              }
            }
          },
          (error) => {
            this.openSnackBar('Hubo un error al consultar', '⛔', 3000);
          }
        );
      }
    } else {
      this.fleteService.getTipoVenta().subscribe(
        (venta) => {
          const localVenta = venta.find(item => item.nombre === 'Local');
          const ventaExiste = this.ventaList.some((venta: { nombre: string; }) => venta.nombre === 'Local')
          if (localVenta) {
            console.log(ventaExiste);
            if (ventaExiste == false) {
              this.ventaList.push(localVenta);
            }
          }
        },
        (error) => {
          this.openSnackBar('Hubo un error al consultar', '⛔', 3000);
        }
      );
      this.tiposSeleccionados = false;
    }
  }

  onVentaSelectionChange() {
    const isLocalSelected = this.venta.value.some((venta: { nombre: string; }) => venta.nombre === 'Local');
    const isAgenciaVirtual = this.venta.value.some((venta: { nombre: string; }) => venta.nombre === 'Satélite');
    const isSateliteSelected = this.venta.value.some((venta: { nombre: string; }) => venta.nombre === 'Agencia');
    const isVirtualSelected = this.tipo.value.some((tipo: { nombre: string; }) => tipo.nombre === 'Virtual');

    if (isLocalSelected == true && isAgenciaVirtual == true && isSateliteSelected == true) {
      this.ventasSeleccionados = true;
    } else {
      this.ventasSeleccionados = false;
    }
    if (isLocalSelected == true || isAgenciaVirtual == true || isSateliteSelected == true) {
      if (isLocalSelected == true && this.tipo.value.length != 2) {
        this.tipoList = this.tipoList.filter((item) => item.nombre !== 'Virtual');
      }
      if (isLocalSelected == true && isAgenciaVirtual == false && isSateliteSelected == false && this.tipo.value.length != 2) {
        this.tipoList = this.tipoList.filter((item) => item.nombre !== 'Virtual');
      }
      if (isAgenciaVirtual == true && isSateliteSelected == true && isLocalSelected == false && this.tipo.value.length == 1 && isVirtualSelected == false) {
        this.tipoList = this.tipoList.filter((item) => item.nombre !== 'Virtual');
      }
      if (isAgenciaVirtual == true && isSateliteSelected == true && isLocalSelected == false && this.tipo.value.length != 2) {
        this.tipoList = this.tipoList.filter((item) => item.nombre !== 'Local');
      }
    } else {
      console.log("fuera");
      this.fleteService.getUbicacionTalon().subscribe(
        (tipo) => {

          const virtual = tipo.find(item => item.nombre === 'Virtual');
          const tipoExiste = this.tipoList.some((venta: { nombre: string; }) => venta.nombre === 'Virtual')
          if (virtual) {
            if (tipoExiste == false) {
              this.tipoList.push(virtual!);
            }
          }
        },
        (error) => {
          this.openSnackBar('Hubo un error al consultar', '⛔', 3000);
        })
      this.ventasSeleccionados = false;
    }

  }

  applyFilter() {
    const filters = {
      claTalon: this.numeroTalonFiltro.value,
      tipoTalon: this.tipoTalonFiltro.value,
      flete: this.fleteFiltro.value,
      cdp: this.cdpFiltro.value,
      bulto: this.bultosFiltro.value,
      volumen: this.valumenFiltro.value,
      queContiene: this.contieneFiltro.value,
      origen: this.origenFiltro.value,
      documenta: this.DocumentaFiltro.value,
      tipo: this.tipoFiltro.value,
      venta: this.ventaFiltro.value,
      destino: this.destinoFiltro.value,
      tipoGuia: this.tipoGuiaFiltro.value,
      noEconomico: this.noEconomicoFiltro.value,
    };

    this.dataSource.filterPredicate = (data: DatosTalon, filter: string) => {
      const filtersObj = JSON.parse(filter);
      const claTalonMatch = data.claTalon?.toString().toLowerCase().includes(filtersObj.claTalon?.toLowerCase() || '');
      const tipoTalonMatch = data.tipoTalon?.toLowerCase().includes(filtersObj.tipoTalon?.toLowerCase() || '');
      const fleteMatch = data.flete?.toString().toLowerCase().includes(filtersObj.flete?.toLowerCase() || '');
      const cdpMatch = data.cdp?.toString().toLowerCase().includes(filtersObj.cdp?.toLowerCase() || '');
      const bultoMatch = data.bulto?.toString().toLowerCase().includes(filtersObj.bulto?.toLowerCase() || '');
      const volumenMatch = data.volumen?.toString().toLowerCase().includes(filtersObj.volumen?.toLowerCase() || '');
      const contieneMatch = data.queContiene?.toString().toLowerCase().includes(filtersObj.queContiene?.toLowerCase() || '');
      const documentaMatch = data.nombreOficinaDocumenta?.toLowerCase().includes(filtersObj.documenta?.toLowerCase() || '');
      const origenMatch = data.origen?.toLowerCase().includes(filtersObj.origen?.toLowerCase() || '');
      const tipoMatch = data.tipo?.toLowerCase().includes(filtersObj.tipo?.toLowerCase() || '');
      const ventaMatch = data.venta?.toLowerCase().includes(filtersObj.venta?.toLowerCase() || '');
      const destinoMatch = data.destino?.toLowerCase().includes(filtersObj.destino?.toLowerCase() || '');
      const tipoGuiaMatch = data.tipoGuia?.toLowerCase().includes(filtersObj.tipoGuia?.toLowerCase() || '');
      const noEconomicoMatch = data.noEconomico?.toString().toLowerCase().includes(filtersObj.noEconomico?.toLowerCase() || '');

      return claTalonMatch && tipoTalonMatch && fleteMatch && cdpMatch && bultoMatch && volumenMatch && contieneMatch && documentaMatch && origenMatch && tipoMatch && ventaMatch && destinoMatch && tipoGuiaMatch && noEconomicoMatch;
    };

    this.dataSource.filter = JSON.stringify(filters);
  }

  limpiarFormulario(): void {
    this.tipo.setValue([]);
    this.venta.setValue([]);
    this.formGroupFiltro.reset({
      idCedisLocal: this.inputValueLocal
    });
    this.selectedCedis=null;
    this.selectedZona=null;
    this.formGroupFiltro.get('idCedis')?.setValue(null);
    this.formGroupFiltro.get('zona')?.setValue(null);
    this.dataSource = new MatTableDataSource<DatosTalon>(); // Asignar un nuevo dataSource vacío
    this.dataSource.sort = this.sort;
  }
}


