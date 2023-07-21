
import { AfterViewInit, Component, TemplateRef, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorIntl, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
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
  private oficinaResponse: any;

  displayedColumns: string[] = ['index', 'talon', 'talontipo', 'flete', 'cdp', 'bultos', 'contiene', 'volumen', 'noEconomico', 'origen', 'tipoVenta', 'destino'];
  //dataSource!: MatTableDataSource<fleteData>;
  venta = new FormControl();
  tipo = new FormControl();
  ventaList= [
  { nombre: 'Local', valor: 1 },
  { nombre: 'Agencia', valor: 2 },
  { nombre: 'Satelite', valor: 3 }
  ];
  tipoList= [
    { nombre: 'Piso', valor: 'P' },
    { nombre: 'Virtual', valor: 'V' },
  ];
  fleteFilter = new FormControl();
  cdpFilter = new FormControl();

  filteredSucursales: any[] = [];
  filteredZonas: any[] = [];
  cedis: cedis[] = [];
  zonasInfluencia: zonasInfluencia[] = [];
  selectedSatelite: any;
  selectedZonasInfluencia: any;
  placeholderSucursal = 'Zona';
  inputValue!:number;
  inputValueLocal='';
  placeholderText = '';
  placeholderTextLocal = '';
  disabledCedis = false;
  inputCedis = true;
  idCedisLocal!:number;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('dialogTemplate') dialogTemplate!: TemplateRef<any>;
  @ViewChild('dialogRoles') dialogRoles!: TemplateRef<any>;
  Flete: any;
  dateFilter:any;
  constructor(public dialog: MatDialog, private authService: AuthService, public snackBar: MatSnackBar, private router: Router,
              private formBuilder: FormBuilder,private oficinaService: oficinasService,private sateliteService: sateliteService,
              private oficinasService:oficinasService) {

  }

  ngOnInit(): void {
    const SISTEMA: number = 14;
    const MODULO: number = 78;

    this.formGroupFiltro = new FormGroup({
      idCedis: new FormControl(),
      idCedisLocal: new FormControl(),
      idZona:new FormControl()
    });
    this.formGroupFiltro = this.formBuilder.group({
      idCedis: [null, Validators.compose([Validators.required])],
      idZona: [null, Validators.compose([Validators.required])],
      idCedisLocal: [null, Validators.compose([Validators.required])]
    });
    this.formGroupFiltro = this.formBuilder.group({
      idCedis: '',
      idZona:'',
      idCedisLocal:{ value: ' ', disabled: true }
    });

    this.dateFilter = (date: Date | null): boolean => {
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(today.getDate() - 2);

      // Permite las fechas dentro del rango entre ayer y hoy
      return date! >= yesterday && date! <= today;
    }


    this.fechaInicio();
    let oficinaUsuario =this.authService.getOficina();
    console.log("usuario:")
    console.log(oficinaUsuario);
    if(oficinaUsuario=='1100'){
        this.inputValue = Number("1100");
        this.placeholderText = "CORPORATIVO";
        this.inputCedis = true;
    }else{
      this.oficinasService.getOficina(Number(oficinaUsuario)).subscribe(response => {
        this.inputValueLocal = response.plaza.toLocaleUpperCase();
        this.inputCedis = false;
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
          this.openSnackBar('No tienes permisos para entrar a este modulo', '⛔',3000);
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

    forkJoin([ this.oficinaService.getOficinas(), this.oficinaService.getZonasInfluencia()]).subscribe(
      ([cedis, zonasInfluencia]) => {
        this.cedis = cedis;
        this.zonasInfluencia = zonasInfluencia;
      },
      (error) => {
        this.openSnackBar('Hubo un error al consultar', '⛔', 3000);
      }
    );

  }
  ventasSeleccionados = false;
  tiposSeleccionados = false;

  // Función para marcar y desmarcar todos los elementos
  seleccionarTodosVenta() {
    console.log(this.ventasSeleccionados)
    this.ventasSeleccionados = !this.ventasSeleccionados;
    if (this.ventasSeleccionados) {
      this.venta.setValue([...this.ventaList]);
    } else {
      this.venta.setValue([]);
    }
  }

  seleccionarTodosTipo() {
    this.tiposSeleccionados = !this.tiposSeleccionados;
    if (this.tiposSeleccionados) {
      this.tipo.setValue([...this.tipoList]);
    } else {
      this.tipo.setValue([]);
    }
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


  formatDate(date:any) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  openDialog(): void {
    this.dialog.open(this.dialogTemplate);
  }
  openDialogPermisos(): void {
    this.dialog.open(this.dialogRoles);
  }
  oncloseDialog(): void {
    this.dialog.closeAll();

  }

  ngAfterViewInit() {

  }

  applyFilter(event: Event) {

  }
  applyFilter1(event: Event) {

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
    this.selectedSatelite = sucursal.id;
    return sucursal ? sucursal.nombre : '';
  }
  displayFnZonas(zona: any): string {
    this.selectedZonasInfluencia = zona.idZona;
    return zona ? zona.nombre : '';
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
    let filtered: any[] = [];
    if (query) {
      const lowercaseQuery = query.toLowerCase();
      filtered = this.zonasInfluencia.filter((zona) =>
        zona.nombre.toLowerCase().includes(lowercaseQuery)
      );
    } else {
      filtered = this.zonasInfluencia;
    }
    return filtered;
  }

  buscar(){

  }

}


