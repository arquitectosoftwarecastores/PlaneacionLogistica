import { Component, TemplateRef, ViewChild, OnInit } from '@angular/core';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/authentication/login/auth.service';
import { cortesPlaneacion } from 'src/app/interfaces/cortes';
import { consultaCorteService } from '../../../services/consultaCorte';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { CustomPaginator } from 'src/app/shared/paginator/custompaginator';
export interface UserData {
  numero: string;
  personal: string;
  sistema: string;
  tipoUsuario: string;
  roles: string;
}

@Component({
  selector: 'app-consulta-corte',
  templateUrl: './consulta-corte.component.html',
  styleUrls: ['./consulta-corte.component.css'],
  providers: [
    { provide: MatPaginatorIntl, useValue: CustomPaginator() }
  ]
})

export class ConsultaCorteComponent implements OnInit {

  public permisoAInsertarAgregar: any = 0;
  public permisoBConsultar: any = 0;
  private permisoCEliminar: any = 0;
  public permisoDActualizar: any = 0;
  private permisoEAutorizar: any = 0;
  private permisoFRechazar: any = 0;
  private permisoHDescargar: any = 0;
  private permisoIImprimir: any = 0;
  public formGroupFiltro: any;
  inicioFiltro: any;
  FinFiltro: any;
  isLoading: boolean = true;
  displayedColumns: string[] = ['idCorte', 'fechaMod', 'horaMod', 'nombreTipoVenta', 'nombreTipoCorte', 'detalles'];
  dataSource!: MatTableDataSource<cortesPlaneacion>;
  fechaInicio!: string;
  fechaFin!: string;
  oficina!: string;

  idCorteFiltro = new FormControl();
  fechaModFiltro = new FormControl();
  horaModFiltro = new FormControl();
  nombreTipoVentaFiltro = new FormControl();
  nombreTipoCorteFiltro = new FormControl();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;
  @ViewChild('dialogTemplate') dialogTemplate!: TemplateRef<any>;
  @ViewChild('dialogRoles') dialogRoles!: TemplateRef<any>;
  @ViewChild('tablaCortesSort', { static: false }) set tablaCortesSort(sort: MatSort) {
    if (this.validaInformacion(sort) && this.dataSource) {
        this.dataSource.sort = sort;
    }
  }


  constructor(public snackBar: MatSnackBar, public dialog: MatDialog, private router: Router, private authService: AuthService, private consultaCorteService: consultaCorteService,
    private formBuilder: FormBuilder, private route: ActivatedRoute) { }

  ngOnInit(): void {
    const SISTEMA: number = 14;
    const MODULO: number = 79;
    this.formGroupFiltro = new FormGroup({
      fechaInicio: new FormControl(),
      fechafin: new FormControl()
    });
    this.formGroupFiltro = this.formBuilder.group({
      fechaInicio: [{ value: ' ', disabled: true }, Validators.compose([Validators.required])],
      fechaFin: [{ value: ' ', disabled: true }, Validators.compose([Validators.required])]
    });
    this.formGroupFiltro.get('fechaFin')?.valueChanges.subscribe((selectedDate: Date) => {
      // Si se selecciona una fecha de inicio, ajustar la fecha de fin para que tenga un mes de diferencia
      if (selectedDate) {
        const fechaFin = new Date(selectedDate);
        fechaFin.setMonth(fechaFin.getMonth() - 1, fechaFin.getDate());

      }
    });

    this.formGroupFiltro.get('fechaInicio')?.valueChanges.subscribe((selectedDate: Date) => {
      // Si se selecciona una fecha de inicio, ajustar la fecha de fin para que tenga un mes de diferencia
      if (selectedDate) {
        const fechaFin = new Date(selectedDate);

        fechaFin.setMonth(fechaFin.getMonth() - 1, fechaFin.getDate());

      }
    });

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


    //Obetner los parametros de la ruta
    this.route.params.subscribe((params: { [x: string]: any; }) => {
      this.fechaInicio = params['fechaInicio'];
      this.fechaFin = params['fechaFin'];
    });

    const pattern = /^\d{4}-\d{2}-\d{2}$/;
    const inicioValid = pattern.test(this.fechaInicio);
    const finValid = pattern.test(this.fechaFin);

    if (!inicioValid || !finValid) {
      this.router.navigate(['/home/inicio']);
    } else {
      const filtro = {
        "fechaInicio": this.fechaInicio,
        "fechaFin": this.fechaFin,
        "oficina": this.obtenerIdOficina()
      }

      let mensajeConsulta = '';
      //buscar los cortes por oficina.
      if (this.obtenerIdOficina() == '1100') {
        this.consultaCorteService.getAllCortes(filtro).subscribe(
          (success: any) => {
            this.isLoading = false;
            this.dataSource = new MatTableDataSource<cortesPlaneacion>(success as cortesPlaneacion[]);
            this.dataSource.paginator = this.paginator;
            this.paginator.pageSize = 5;
            this.dataSource.sort = this.tablaCortesSort;
            if (this.dataSource.data.length > 0) {
              mensajeConsulta = '.';
            } else {
              mensajeConsulta = ' pero no se encontraron registros.';
            }
            this.openSnackBar('Consulta corte.' + mensajeConsulta, '✅', 3000);
          },
          (error: any) => {
            this.isLoading = false;
            if(error.status === 404){
              this.openSnackBar('Se realizo la consulta de manera exitosa pero no se encuentran registros relacionados en la oficina actual.', '✅', 3000);
            }else{
              this.openSnackBar('Hubo un error al hacer la consulta.', '⛔', 3000);
            }
          });
      } else {
        //Buscar todos los cortes
        this.consultaCorteService.getCortesOficinas(filtro).subscribe(
          (success: any) => {
            this.isLoading = false;
            this.dataSource = new MatTableDataSource<cortesPlaneacion>(success as cortesPlaneacion[]);
            this.dataSource.paginator = this.paginator;
            this.paginator.pageSize = 5;
            this.dataSource.sort = this.tablaCortesSort;
            if (this.dataSource.data.length > 0) {
              mensajeConsulta = '.';
            } else {
              mensajeConsulta = ' pero no se encontraron registros relacionados en la oficina actual.';
            }
            this.openSnackBar('Consulta corte.', '✅', 3000);
          },
          (error: any) => {
            this.isLoading = false;
            if(error.status === 404){
              this.openSnackBar('Se realizo la consulta de manera exitosa pero no se encuentran registros relacionados en la oficina actual.', '✅', 3000);
            }else{
              this.openSnackBar('Hubo un error al hacer la consulta.', '⛔', 3000);
            }

          });
      }
      this.inicioFiltro = (date: Date | null): boolean => {
        if (!date) return false;
        const today = new Date();
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());

        return date >= lastMonth && date <= today;
      };
      this.FinFiltro = (date: Date | null): boolean => {
        if (!date) return false;
        const today = new Date();
        const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate());
        return date >= lastMonth && date <= today;
      }
    }
  }

  /**
    * openSnackBar: Funcion para ver los mensajes.
    *
    * @param fecha (string)
    * @return Date
    * @author Oswaldo Ramirez [desarrolloti43]
    * @date 2023-07-16
   */

  openSnackBar(message: string, action: string, tiempo: number): void {
    this.snackBar.open(message, action, {
      duration: tiempo
    });
  }

   /**
    * validaInformacion: cargarDatos: Funcion para validar la informacion
    *
    * @param fecha (string)
    * @return Date
    * @author Oswaldo Ramirez [desarrolloti43]
    * @date 2023-07-17
   */
  validaInformacion(dato: any): boolean {
    if (dato != undefined && dato != null && dato != '' && dato != "Invalid Date") {
      return true;
    }
    else {
      return false;
    }
  }

  /**
    * detalle: Funcion para redireccionar al componente detalleCorteComponent
    *
    * @param fecha (string)
    * @return Date
    * @author Oswaldo Ramirez [desarrolloti43]
    * @date 2023-07-17
   */
  detalle(detalle: string) {
    let fechaInicioValue = this.formGroupFiltro.get('fechaInicio').value;
    let fechaFinValue = this.formGroupFiltro.get('fechaFin').value;
    if (fechaInicioValue != ' ' && fechaFinValue != ' ') {
      const fechaInicio = new Date(fechaInicioValue);
      const fechaFin = new Date(fechaFinValue);

      const formattedFechaInicio = `${fechaInicio.getFullYear()}-${(fechaInicio.getMonth() + 1).toString().padStart(2, '0')}-${fechaInicio.getDate().toString().padStart(2, '0')}`;
      const formattedFechaFin = `${fechaFin.getFullYear()}-${(fechaFin.getMonth() + 1).toString().padStart(2, '0')}-${fechaFin.getDate().toString().padStart(2, '0')}`;

      this.router.navigate(['home/flete/DetallesCorte/' + formattedFechaInicio + '/' + formattedFechaFin + '/' + detalle]);
    } else {
      let fechaInicioValue = new Date();
      let fechaFinValue = new Date();

      const fechaInicio = new Date(fechaInicioValue);
      const fechaFin = new Date(fechaFinValue);
      const formattedFechaInicio = `${fechaInicio.getFullYear()}-${(fechaInicio.getMonth() + 1).toString().padStart(2, '0')}-${fechaInicio.getDate().toString().padStart(2, '0')}`;
      const formattedFechaFin = `${fechaFin.getFullYear()}-${(fechaFin.getMonth() + 1).toString().padStart(2, '0')}-${fechaFin.getDate().toString().padStart(2, '0')}`;
      this.router.navigate(['home/flete/DetallesCorte/' + formattedFechaInicio + '/' + formattedFechaFin + '/' + detalle]);
    }

  }
  /**
    * obtenerIdOficina: Funcion para obtener el idOficina del usuario
    *
    * @param fecha (string)
    * @return Date
    * @author Oswaldo Ramirez [desarrolloti43]
    * @date 2023-07-17
   */
  obtenerIdOficina(): string {
    let idoficinaJson = JSON.parse(sessionStorage.getItem('usuario')!);
    return idoficinaJson.claveOficina;
  }

  /**
    * buscar: Funcion para buscar los cortes por fecha seleccionada.
    *
    * @param fecha (string)
    * @return Date
    * @author Oswaldo Ramirez [desarrolloti43]
    * @date 2023-07-18
   */
  buscar() {
    const fechaInicio = this.formGroupFiltro.get('fechaInicio').value;
    const fechaFinal = this.formGroupFiltro.get('fechaFin').value;
    let oficina = this.obtenerIdOficina() === '1100' ? '1100' : this.obtenerIdOficina();
    const filtro = {
      "fechaInicio": fechaInicio,
      "fechaFin": fechaFinal,
      "oficina": oficina
    }
    let mensajeConsulta = '';
    if (fechaInicio == null) {
      this.openSnackBar('Debe seleccionar una fecha en fecha inicio.', '⛔', 3000);
    } else if (fechaFinal == null) {
      this.openSnackBar('Debe seleccionar una fecha en fecha fin.', '⛔', 3000);
    } else if (fechaInicio > fechaFinal) {
      this.openSnackBar('La fecha inicio no puede ser mayor a fecha fin', '⛔', 3000);
    } else if (this.obtenerIdOficina() == '1100') {
      this.isLoading = true;
      this.consultaCorteService.getAllCortes(filtro).subscribe(
        (success: any) => {
          this.isLoading = false;
          this.dataSource = new MatTableDataSource<cortesPlaneacion>(success as cortesPlaneacion[]);
          this.dataSource.paginator = this.paginator;
          this.paginator.pageSize = 5;
          this.dataSource.sort = this.tablaCortesSort;
          if (this.dataSource.data.length > 0) {
            mensajeConsulta = '.';
          } else {
            mensajeConsulta = ' pero no se encontraron registros.';
          }
          this.openSnackBar('Se realizo la consulta de manera exitosa' + mensajeConsulta, '✅', 3000);
        },
        (error: any) => {
          this.isLoading = false;
          this.openSnackBar('Hubo un error al hacer la consulta.', '⛔', 3000);
        });
    } else {
      this.isLoading = true;
      this.consultaCorteService.getCortesOficinas(filtro).subscribe(
        (success: any) => {
          this.isLoading = false;
          this.dataSource = new MatTableDataSource<cortesPlaneacion>(success as cortesPlaneacion[]);
          this.dataSource.paginator = this.paginator;
          this.paginator.pageSize = 5;
          this.dataSource.sort = this.tablaCortesSort;
          if (this.dataSource.data.length > 0) {
            mensajeConsulta = '.';
          } else {
            mensajeConsulta = ' pero no se encontraron registros.';
          }
          this.openSnackBar('Se realizo la consulta de manera exitosa' + mensajeConsulta, '✅', 3000);
        },
        (error: any) => {
          this.isLoading = false;
          this.openSnackBar('Hubo un error al hacer la consulta.', '⛔', 3000);
        });
    }
  }
  /**
    * onFechaInicioChange,onFechaFinChange: Funcion para el evento del filtro de la tabla tipo venta
    * @param fecha (string)
    * @return Date
    * @author Oswaldo Ramirez [desarrolloti43]
    * @date 2023-07-18
   */
  onFechaInicioChange(event: any) {
    return event.value;
  }
  onFechaFinChange(event: any) {
    return event.value;
  }

  /**
    * applyFilter: Funcion para el filtrado de la tabla
    * @param fecha (string)
    * @return Date
    * @author Oswaldo Ramirez [desarrolloti43]
    * @date 2023-07-18
   */

  applyFilter() {
    const filters = {
      idCorte: this.idCorteFiltro.value,
      fechaMod: this.fechaModFiltro.value,
      horaMod: this.horaModFiltro.value,
      nombreTipoVenta: this.nombreTipoVentaFiltro.value,
      nombreTipoCorte: this.nombreTipoCorteFiltro.value,
    };

    this.dataSource.filterPredicate = (data: cortesPlaneacion, filter: string) => {
      const filtersObj = JSON.parse(filter);
      const idCorteMatch = data.idCorte?.toString().toLowerCase().includes(filtersObj.idCorte?.toLowerCase() || '');
      const fechaModMatch = data.fechaMod?.toLowerCase().includes(filtersObj.fechaMod?.toLowerCase() || '');
      const horaModMatch = data.horaMod?.toString().toLowerCase().includes(filtersObj.horaMod?.toLowerCase() || '');
      const nombreTipoVentaMatch = this.checkNombreTipoVenta(data, filtersObj.nombreTipoVenta);
      const nombreTipoCorteMatch = this.checkNombreTipoUbicacion(data, filtersObj.nombreTipoCorte);
      return idCorteMatch && fechaModMatch && horaModMatch && nombreTipoVentaMatch && nombreTipoCorteMatch;
    };

    this.dataSource.filter = JSON.stringify(filters);
  }
  /**
    * checkNombreTipoVenta: Funcion para el evento del filtro de la tabla tipo venta
    * @param fecha (string)
    * @return Date
    * @author Oswaldo Ramirez [desarrolloti43]
    * @date 2023-07-18
   */
  checkNombreTipoVenta(data: any, filterValue: string): boolean {
    const lowercaseFilterValue = this.removeAccents(filterValue.toLowerCase());
    if (lowercaseFilterValue === 'local') {
      return data.nombreTipoVenta?.toLowerCase() === 'local' && !filterValue.includes(',');
    } else if (lowercaseFilterValue === 'agencia' || lowercaseFilterValue === 'satelite') {
      return data.nombreTipoVenta?.toLowerCase() === lowercaseFilterValue;
    } else {
      const normalizedNombreTipoVenta = this.removeAccents(data.nombreTipoVenta?.toLowerCase() || '');
      return normalizedNombreTipoVenta.includes(lowercaseFilterValue);
    }
  }
  /**
    * checkNombreTipoUbicacion: Funcion para el evento del filtro de la tabla tipo de ubicacion
    * @param fecha (string)
    * @return Date
    * @author Oswaldo Ramirez [desarrolloti43]
    * @date 2023-07-18
   */
  checkNombreTipoUbicacion(data: any, filterValue: string): boolean {
    const lowercaseFilterValue = this.removeAccents(filterValue.toLowerCase());
    if (lowercaseFilterValue === 'piso') {
      return data.nombreTipoCorte?.toLowerCase() === 'piso' && !filterValue.includes(',');
    } else if (lowercaseFilterValue === 'virtual') {
      return data.nombreTipoCorte?.toLowerCase() === lowercaseFilterValue;
    } else {
      const normalizedNombreTipocorte= this.removeAccents(data.nombreTipoCorte?.toLowerCase() || '');
      return normalizedNombreTipocorte.includes(lowercaseFilterValue);
    }
  }
  /**
    * removeAccents: Funcion para borrar los acentos del texto
    * @param fecha (string)
    * @return Date
    * @author Oswaldo Ramirez [desarrolloti43]
    * @date 2023-07-18
   */
  removeAccents(text: string): string {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }


/**
    * limpiarFormulario: Funcion para limpiar el formulario y los filtros de la tabla
    * @param fecha (string)
    * @return Date
    * @author Oswaldo Ramirez [desarrolloti43]
    * @date 2023-07-21
   */

  limpiarFormulario(): void {
    this.formGroupFiltro.reset();
    this.dataSource = new MatTableDataSource<cortesPlaneacion>(); // Asignar un nuevo dataSource vacío
    this.dataSource.sort = this.sort;
    this.idCorteFiltro.setValue('');
    this.fechaModFiltro.setValue('');
    this.horaModFiltro.setValue('');
    this.nombreTipoVentaFiltro.setValue('');
    this.nombreTipoCorteFiltro.setValue('');
    this.applyFilter();
  }
}
