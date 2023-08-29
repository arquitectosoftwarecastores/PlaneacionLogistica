
import { Component, TemplateRef, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorIntl} from '@angular/material/paginator';
import { MatSort} from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog} from '@angular/material/dialog';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/authentication/login/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { cedis } from 'src/app/interfaces/oficina';
import { oficinasService } from 'src/app/services/oficinas.service';
import { CustomPaginator } from 'src/app/shared/paginator/custompaginator';
import { forkJoin } from 'rxjs';
import { zonasInfluencia } from 'src/app/interfaces/zonasInfluencia';
import { tipoVenta } from 'src/app/interfaces/tipoVenta';
import { fletesService } from 'src/app/services/flete.service';
import { ubicacionTalon } from 'src/app/interfaces/ubicacionTalon';
import { DatosTalon } from 'src/app/interfaces/datosTalon';
import { consultaCorteService } from 'src/app/services/consultaCorte';
import * as moment from 'moment';

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
  ventasSeleccionados = false;
  tiposSeleccionados = false;

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
    // Numero de sistema y modulo del componente
    const SISTEMA: number = 14;
    const MODULO: number = 78;
    // mostrar todas las columnas del mat-table
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
      this.oficinasService.getOficina(oficinaUsuario).subscribe(response => {
        this.inputValueLocal = response.plaza.toLocaleUpperCase();
      }, (error: any) => {
        this.openSnackBar('Hubo un error al consultar el satelite', '⛔', 3000);
      });
    }
    //Validar los permisos que tiene el usuario en el modulo
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
        this.openSnackBar('Planeacion principal.', '✅', 3000);
      },
      (error) => {
        this.isLoading = false;
        this.openSnackBar('Hubo un error al consultar', '⛔', 3000);
      }
    );
  }

/**
    * seleccionarTodosVenta: Funcion para seleccionar todas las opciones del mat-select tipos venta
    * @param fecha (string)
    * @return Date
    * @author Oswaldo Ramirez [desarrolloti43]
    * @date 2023-07-11
   */
  seleccionarTodosVenta() {
    this.ventasSeleccionados = !this.ventasSeleccionados;
    if (this.ventasSeleccionados) {
      this.venta.setValue([...this.ventaList]);
      this.fleteService.getUbicacionTalon().subscribe(
        (tipo) => {

          const virtual = tipo.find(item => item.nombre === 'Virtual');
          const tipoExiste = this.tipoList.some((venta: { nombre: string; }) => venta.nombre === 'Virtual')
          if (virtual && tipoExiste == false) {
              this.tipoList.push(virtual!);
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
          if (virtual && tipoExiste == false) {
              this.tipoList.push(virtual!);
          }
        },
        (error) => {
          this.openSnackBar('Hubo un error al consultar', '⛔', 3000);
        })
    }
  }

/**
    * seleccionarTodosTipo: Funcion para seleccionar todas las opciones del mat-select tipos de ubicacion de los talones
    * @param fecha (string)
    * @return Date
    * @author Oswaldo Ramirez [desarrolloti43]
    * @date 2023-07-11
   */

  seleccionarTodosTipo() {
    this.tipo.setValue(this.tiposSeleccionados ? [] :this.tipoList);
    const isPisoSelected = this.tipo.value.some((tipo: { nombre: string; }) => tipo.nombre === 'Piso');
    const isPisoVirtual = this.tipo.value.some((tipo: { nombre: string; }) => tipo.nombre === 'Virtual');
    if (isPisoSelected == true || isPisoVirtual == true) {
      if (isPisoVirtual && isPisoSelected == false) {
        this.ventaList = this.ventaList.filter((item) => item.nombre !== 'Local');
      } else {
        this.fleteService.getTipoVenta().subscribe(
          (venta) => {
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
  /**
    * fechaInicio: Funcion para obtener fechas del dia de actual y anterior
    * @param fecha (string)
    * @return Date
    * @author Oswaldo Ramirez [desarrolloti43]
    * @date 2023-07-11
   */

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
  /**
    * onInputSucursales: Funcion para el evento del filtrado en el mat-input zonas
    * @param fecha (string)
    * @return Date
    * @author Oswaldo Ramirez [desarrolloti43]
    * @date 2023-07-14
   */

  onInputSucursales(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.filteredSucursales = this.filtrarDatosCedis(inputElement.value);
  }
  /**
    * onInputZonas: Funcion para el evento del filtrado en el mat-input cedis
    * @param fecha (string)
    * @return Date
    * @author Oswaldo Ramirez [desarrolloti43]
    * @date 2023-07-14
   */

  onInputZonas(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.filteredZonas = this.filtrarDatosZonasInfluencia(inputElement.value);
  }

/**
    * formatDate: Funcion para obtener formato de la fecha
    * @param fecha (string)
    * @return Date
    * @author Oswaldo Ramirez [desarrolloti43]
    * @date 2023-07-14
   */

  formatDate(date: any) {
    return moment(date).format('YYYY-MM-DD');
  }
/**
    * openDialog: Funcion para abrir modal de guardar corte
    * @param fecha (string)
    * @return Date
    * @author Oswaldo Ramirez [desarrolloti43]
    * @date 2023-07-14
   */
  openDialog(): void {
    this.formGroupCorte.reset();
    this.dialog.open(this.dialogCorte);
  }
/**
    * oncloseDialog: Funcion para cerrar modal de guardar corte
    * @param fecha (string)
    * @return Date
    * @author Oswaldo Ramirez [desarrolloti43]
    * @date 2023-07-14
   */
  oncloseDialog(): void {
    this.dialog.closeAll();
  }

  /**
    * displayFn: Funcion de filtrado para mostrar la informacion en el mat-input de los cedis
    * @param fecha (string)
    * @return Date
    * @author Oswaldo Ramirez [desarrolloti43]
    * @date 2023-07-15
   */
  displayFn(sucursal: any): string {
    this.selectedSatelite = sucursal?.idOficina;
    return sucursal ? sucursal.nombreOficina : '';
  }
  /**
    * displayFnZonas: Funcion de filtrado para mostrar la informacion en el mat-input zonas de influencia
    * @param fecha (string)
    * @return Date
    * @author Oswaldo Ramirez [desarrolloti43]
    * @date 2023-07-15
   */
  displayFnZonas(zona: any): string {
    if (zona) {
      this.selectedZonasInfluencia = zona.idZona;
      return zona.nombre;
    } else {
      return '';
    }
  }
/**
    * filtrarDatosCedis: Funcion para obtener el filtrado del mat-input de los cedis
    * @param fecha (string)
    * @return Date
    * @author Oswaldo Ramirez [desarrolloti43]
    * @date 2023-07-15
   */
  filtrarDatosCedis(query: string): any[] {
    return  query ?  this.cedis.filter((sucursal) =>
        sucursal.nombreOficina.toLowerCase().includes(query.toLowerCase())
      ) : this.cedis;
  }
  /**
    * filtrarDatosZonasInfluencia: Funcion para obtener el filtrado del mat-input zonas de influencia
    * @param fecha (string)
    * @return Date
    * @author Oswaldo Ramirez [desarrolloti43]
    * @date 2023-07-15
   */
  filtrarDatosZonasInfluencia(query: string): any[] {
    return  query ?  this.zonasInfluencia.filter((zona) =>
    zona.nombre.toLowerCase().includes(query.toLowerCase())
      ) : this.zonasInfluencia;
  }
  /**
    * onFechaInicioChange, onFechaFinChange: Funcion para obtener el valor de los may-input tipo date
    *
    * @param fecha (string)
    * @return Date
    * @author Oswaldo Ramirez [desarrolloti43]
    * @date 2023-07-16
   */
  onFechaInicioChange(event: any) {
    return event.value;
  }

  onFechaFinChange(event: any) {
    return event.value;
  }
  /**
    * buscar: Funcion para buscar los talones
    *
    * @param fecha (string)
    * @return Date
    * @author Oswaldo Ramirez [desarrolloti43]
    * @date 2023-07-16
   */

  buscar() {
    const fechaInicio = this.formGroupFiltro.get('fechaInicio').value;
    const fechaFinal = this.formGroupFiltro.get('fechaFin').value;
    const zonaInfluencia = this.formGroupFiltro.get('zona').value;
    const cedisOrigen = this.formGroupFiltro.get('idCedis').value;
    let tablaList1 = new MatTableDataSource<DatosTalon>()
    let tablaList2 = new MatTableDataSource<DatosTalon>()
    let tablaList3 = new MatTableDataSource<DatosTalon>()
    let inicio = new Date(fechaInicio);
    const columnasOcultas = ['tipoGuia', 'noEconomico'];
    const fechaIniciaFormato =  moment(inicio).format('YYYY-MM-DD');
    let fin = new Date(fechaFinal);
    const fechaFinalFormato =  moment(fin).format('YYYY-MM-DD');
    const idCedisInput = this.formGroupFiltro.get('idCedis').value.nombreOficina;
    console.log(idCedisInput);
    let local = +(this.venta.value.some((v: tipoVenta) => v.nombre === 'Local'));
    let agencia = +(this.venta.value.some((v: tipoVenta) => v.nombre === 'Agencia'));
    let satelite = +(this.venta.value.some((v: tipoVenta) => v.nombre === 'Satélite'));
    let oficina = this.obtenerIdOficina() === '1100' ? cedisOrigen.idOficina : this.obtenerIdOficina();
    console.log(cedisOrigen.idOficina);
    if (this.obtenerIdOficina().includes('1100') && cedisOrigen.idOficina == null) {
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
        tablaList1 = new MatTableDataSource<DatosTalon>(piso as DatosTalon[]);
        tablaList2 = new MatTableDataSource<DatosTalon>(local as DatosTalon[]);
        tablaList3 = new MatTableDataSource<DatosTalon>(virtual as DatosTalon[]);
        this.dataSource = new MatTableDataSource([...tablaList1.data, ...tablaList2.data, ...tablaList3.data]);
        this.dataSource.paginator = this.paginator;
        this.paginator.pageSize = 5;
        this.dataSource.sort = this.tablaPlaneacionSort;
        let mensajeConsulta  = (this.mostrarBoton = this.dataSource.data.length > 0) ? '.' : ' pero no se encontraron registros.';
        this.openSnackBar('Se realizo la consulta de manera exitosa' + mensajeConsulta, '✅', 3000);
        this.isLoading = false;
        console.log(this.dataSource.data)
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
                tablaList1 = new MatTableDataSource<DatosTalon>(piso as DatosTalon[]);
                tablaList3 = new MatTableDataSource<DatosTalon>(virtual as DatosTalon[]);
                this.dataSource = new MatTableDataSource([...tablaList1.data, ...tablaList2.data, ...tablaList3.data]);
                this.dataSource.paginator = this.paginator;
                this.paginator.pageSize = 5;
                this.dataSource.sort = this.tablaPlaneacionSort;
                let mensajeConsulta  = (this.mostrarBoton = this.dataSource.data.length > 0) ? '.' : ' pero no se encontraron registros.';
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
                tablaList1 = new MatTableDataSource<DatosTalon>(success as DatosTalon[]);
                this.dataSource = new MatTableDataSource([...tablaList1.data, ...tablaList2.data, ...tablaList3.data]);
                this.dataSource.paginator = this.paginator;
                this.paginator.pageSize = 5;
                this.dataSource.sort = this.tablaPlaneacionSort;
                if (local != 1) {
                  let mensajeConsulta  = (this.mostrarBoton = this.dataSource.data.length > 0) ? '.' : ' pero no se encontraron registros.';
                  this.openSnackBar('Se realizo la consulta de manera exitosa' + mensajeConsulta, '✅', 3000);
                  this.isLoading = false;
                }
              },
              (error: any) => {
                this.mostrarBoton = false;
                this.isLoading = false;
                this.openSnackBar('Hubo un error al hacer la consulta.', '⛔', 3000);
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
              tablaList2 = new MatTableDataSource<DatosTalon>(success as DatosTalon[]);
              this.dataSource = new MatTableDataSource([...tablaList1.data, ...tablaList2.data, ...tablaList3.data]);
              this.dataSource.paginator = this.paginator;
              this.paginator.pageSize = 5;
              this.dataSource.sort = this.tablaPlaneacionSort;
              this.isLoading = false;
              let mensajeConsulta  = (this.mostrarBoton = this.dataSource.data.length > 0) ? '.' : ' pero no se encontraron registros.';
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
            this.dataSource = new MatTableDataSource<DatosTalon>(success as DatosTalon[]);
            this.dataSource.paginator = this.paginator;
            this.paginator.pageSize = 5;
            this.dataSource.sort = this.tablaPlaneacionSort;
            this.isLoading = false;
            let mensajeConsulta  = (this.mostrarBoton = this.dataSource.data.length > 0) ? '.' : ' pero no se encontraron registros.';
            this.openSnackBar('Se realizo la consulta de manera exitosa' + mensajeConsulta, '✅', 3000);
          },
          (error: any) => {
            this.mostrarBoton = false;
            this.isLoading = false;
            this.openSnackBar('Hubo un error al hacer la consulta.', '⛔', 3000);
          });
      }
    }

  }
  /**
    * calcularSumatoria: Funcion para calcular la sumatoria de las columnas seleccionadas en el html
    *
    * @param fecha (string)
    * @return Date
    * @author Oswaldo Ramirez [desarrolloti43]
    * @date 2023-07-16
   */

  calcularSumatoria(columna: keyof DatosTalon): number {
    const sum = this.dataSource.filteredData.slice().reduce((sum, currentRow) => {
      const value = currentRow[columna];
      return typeof value === 'number' ? sum + value : sum;
    }, 0);

    return parseFloat(sum.toFixed(2));
  }
  /**
    * validaInformacion: Funcion para validar la informacion
    *
    * @param fecha (string)
    * @return Date
    * @author Oswaldo Ramirez [desarrolloti43]
    * @date 2023-07-16
   */

  validaInformacion(dato: any): boolean {
      return (dato != undefined && dato != null && dato != '' && dato != "Invalid Date");
  }
  /**
    * guardarCorte: Funcion para guardar el corte de la lista de todos los talones encontrados y filtrados
    *
    * @param fecha (string)
    * @return Date
    * @author Oswaldo Ramirez [desarrolloti43]
    * @date 2023-07-17
   */
  guardarCorte() {
    if (this.dataSource.data.length <= 0) {
      this.openSnackBar('No puedes agregar un corte sin tener talones en la tabla.', '⛔', 3000);
    }else if(this.formGroupCorte.get('descripcionCorte').value.length<=10){
      this.openSnackBar('La accion debe de tener mas de 10 caracteres.', '⛔', 3000);
    }else {
      let hoy = new Date();
      const formattedDate =  moment(hoy).format('YYYY-MM-DD');
      const tiempo = moment(hoy).format('HH:mm:ss');;
      const cedisOrigen = this.formGroupFiltro.get('idCedis').value;
      const accion = this.formGroupCorte.get('descripcionCorte').value;
      const jsonData = JSON.stringify(this.dataSource.filteredData.slice());
      const idTipoVentaValues = this.venta.value.map((item: { idTipoVenta: number; }) => item.idTipoVenta);
      idTipoVentaValues.sort((a: number, b: number) => a - b);
      const idTipoVentaString = idTipoVentaValues.join(',');

      let oficina = this.obtenerIdOficina() === '1100' ? cedisOrigen.idOficina : this.obtenerIdOficina();

      this.oncloseDialog();

      const idUbicacionTalonArray = this.tipo.value.map((item: { idUbicacionTalon: any; }) => item.idUbicacionTalon);
      idUbicacionTalonArray.sort((a: number, b: number) => a - b);
      const idUbicacionTalonString = idUbicacionTalonArray.join(',');
      const corte = {
        "idOficina": oficina,
        "tipoCorte": "" + idUbicacionTalonString,
        "tipoVenta": "" + idTipoVentaString,
        "accion": accion,
        "descripcionTabla": "" + jsonData,
        "estatus": 1,
        "idPersonal": this.obtenerIdPersonal(),
        "fechaMod": formattedDate,
        "horaMod": tiempo
      }
      this.isLoading = true;
      this.consultaCorteService.setCorte(corte).subscribe(
        (success: any) => {
          this.openSnackBar('Se guardo de manera exitosa!', '✅', 3000);
          this.mostrarBoton = false;
          this.isLoading = false;
        },
        (error: any) => {
          this.mostrarBoton = false;
          this.isLoading = false;
          this.openSnackBar('Hubo un error al guardar', '⛔', 3000);
        });
    }
  }
  openDialogPermisos(): void {
    this.dialog.open(this.dialogRoles);
  }

  /**
    * obtenerIdPersonal: Funcion para obtener el idPersonal del usuario
    *
    * @param fecha (string)
    * @return Date
    * @author Oswaldo Ramirez [desarrolloti43]
    * @date 2023-07-15
   */

  obtenerIdPersonal(): string {
    let usuarioJson = JSON.parse(sessionStorage.getItem('usuario')!);
    return usuarioJson.id;
  }
  /**
    * obtenerIdOficina: Funcion para obtener el idOficina del usuario
    *
    * @param fecha (string)
    * @return Date
    * @author Oswaldo Ramirez [desarrolloti43]
    * @date 2023-07-15
   */
  obtenerIdOficina(): string {
    let idoficinaJson = JSON.parse(sessionStorage.getItem('usuario')!);
    return idoficinaJson.claveOficina;
  }
  /**
    * bloquearOpcionPiso: Funcion para cambiar las opciones de los tipo venta
    *
    * @param fecha (string)
    * @return Date
    * @author Oswaldo Ramirez [desarrolloti43]
    * @date 2023-07-15
   */

  bloquearOpcionPiso() {
    const isPisoSelected = this.tipo.value.some((tipo: { nombre: string; }) => tipo.nombre === 'Piso');
    const isPisoVirtual = this.tipo.value.some((tipo: { nombre: string; }) => tipo.nombre === 'Virtual');
    if (isPisoSelected == true || isPisoVirtual == true) {
      this.tiposSeleccionados = (isPisoSelected == true && isPisoVirtual == true) ;
      if (isPisoVirtual && isPisoSelected == false) {
        this.ventaList = this.ventaList.filter((item) => item.nombre !== 'Local');
      } else {
        this.fleteService.getTipoVenta().subscribe(
          (venta) => {
            const localVenta = venta.find(item => item.nombre === 'Local');
            const ventaExiste = this.ventaList.some((venta: { nombre: string; }) => venta.nombre === 'Local')
            if (localVenta && ventaExiste == false) {
                this.ventaList.push(localVenta);
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
          if (localVenta && ventaExiste == false) {
              this.ventaList.push(localVenta);
          }
        },
        (error) => {
          this.openSnackBar('Hubo un error al consultar', '⛔', 3000);
        }
      );
      this.tiposSeleccionados = false;
    }
  }
/**
    * onVentaSelectionChange: Funcion para cambiar las opciones de los tipo de ubicaciones de los talones
    *
    * @param fecha (string)
    * @return Date
    * @author Oswaldo Ramirez [desarrolloti43]
    * @date 2023-07-15
   */
  onVentaSelectionChange() {
    const isLocalSelected = this.venta.value.some((venta: { nombre: string; }) => venta.nombre === 'Local');
    const isAgenciaVirtual = this.venta.value.some((venta: { nombre: string; }) => venta.nombre === 'Satélite');
    const isSateliteSelected = this.venta.value.some((venta: { nombre: string; }) => venta.nombre === 'Agencia');
    const isVirtualSelected = this.tipo.value.some((tipo: { nombre: string; }) => tipo.nombre === 'Virtual');

    this.ventasSeleccionados = (isLocalSelected == true && isAgenciaVirtual == true && isSateliteSelected == true);
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
      this.fleteService.getUbicacionTalon().subscribe(
        (tipo) => {
          const virtual = tipo.find(item => item.nombre === 'Virtual');
          const tipoExiste = this.tipoList.some((venta: { nombre: string; }) => venta.nombre === 'Virtual')
          if (virtual && tipoExiste == false) {
              this.tipoList.push(virtual!);
          }
        },
        (error) => {
          this.openSnackBar('Hubo un error al consultar', '⛔', 3000);
        })
      this.ventasSeleccionados = false;
    }

  }

/**
    * applyFilter: Funcion para aplicar el filtro en la tabla de pleaneacion principal
    *
    * @param fecha (string)
    * @return Date
    * @author Oswaldo Ramirez [desarrolloti43]
    * @date 2023-07-15
   */

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
      const tipoTalonFiltered = this.removeAccentsAndLowercase(filtersObj.tipoTalon || '');
      const tipoTalonData = this.removeAccentsAndLowercase(data.tipoTalon || '');
      const tipoTalonMatch = tipoTalonData.includes(tipoTalonFiltered);
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
  removeAccentsAndLowercase(text: string): string {
    return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  }

  /**
    * limpiarFormulario: Funcion para limpiar formulario para la busqueda de los talones.
    *
    * @param fecha (string)
    * @return Date
    * @author Oswaldo Ramirez [desarrolloti43]
    * @date 2023-07-15
   */

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
    this.dataSource = new MatTableDataSource<DatosTalon>();
    this.dataSource.sort = this.sort;
  }
}


