import { AfterViewInit, Component, TemplateRef, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { NgFor } from '@angular/common';
import {
  CdkDrag,
  CdkDragDrop,
  CdkDropList,
  CdkDropListGroup,
  moveItemInArray,
  transferArrayItem,
} from '@angular/cdk/drag-drop';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/authentication/login/auth.service';
import { cortes } from 'src/app/interfaces/cortes';
import { consultaCorteService } from '../../../services/consultaCorte';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

export interface UserData {
  numero: string;
  personal: string;
  sistema: string;
  tipoUsuario: string;
  roles: string;
}

/** Constants used to fill up our data base. */

@Component({
  selector: 'app-consulta-corte',
  templateUrl: './consulta-corte.component.html',
  styleUrls: ['./consulta-corte.component.css']
})
export class ConsultaCorteComponent {

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
  finFiltro: any;
  dateFilter:any;
  isLoading: boolean = true;
  displayedColumns: string[] = ['idCorte', 'fechaMod', 'horaMod', 'nombreTipoVenta', 'nombreTipoCorte', 'detalles'];
  dataSource!: MatTableDataSource<cortes>;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort!: MatSort;
  @ViewChild('dialogTemplate') dialogTemplate!: TemplateRef<any>;
  @ViewChild('dialogRoles') dialogRoles!: TemplateRef<any>;
  @ViewChild('tablaCortesSort', { static: false }) set tablaCortesSort(sort: MatSort) {

    if (this.validaInformacion(sort)) {
      if (this.dataSource) {
        this.dataSource.sort = sort;
      }
    }
  }


  constructor(public snackBar: MatSnackBar, public dialog: MatDialog, private router: Router, private authService: AuthService, private consultaCorteService: consultaCorteService,
    private formBuilder: FormBuilder,) {


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
      if (selectedDate) {
        const fechaInicio = new Date(selectedDate);
        fechaInicio.setMonth(fechaInicio.getMonth() - 1, fechaInicio.getDate());
        this.inicioFiltro = this.createDateFilter(fechaInicio, new Date());
        this.finFiltro = this.dateFilter;
      } else {
        this.inicioFiltro = this.dateFilter;
      }
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
    let inicio = new Date();
    let año = inicio.getFullYear();
    let mes = String(inicio.getMonth() + 1).padStart(2, '0');
    let dia = String(inicio.getDate()).padStart(2, '0');

    const fechaIniciaFormato = `${año}-${mes}-${dia}`;
    let oficina = this.obtenerIdOficina() === '1100' ? '1100' : this.obtenerIdOficina();
    const filtro = {
      "fechaInicio": fechaIniciaFormato,
      "fechaFin": fechaIniciaFormato,
      "oficina": oficina
    }

    if (this.obtenerIdOficina() == '1100') {
      this.consultaCorteService.getAllCortes(filtro).subscribe(
        (success: any) => {
          console.log(success);
          this.isLoading = false;
          this.dataSource = new MatTableDataSource<cortes>(success as cortes[]);
          this.dataSource.paginator = this.paginator;
          this.paginator.pageSize = 5;
          this.dataSource.sort = this.tablaCortesSort;
          this.openSnackBar('Se realizo la consulta de manera exitosa.', '✅', 3000);
        },
        (error: any) => {
          this.openSnackBar('Hubo un error al hcaer la consulta.', '⛔', 3000);
        });
    } else {
      this.consultaCorteService.getCortesOficinas(filtro).subscribe(
        (success: any) => {
          console.log(success);
          this.isLoading = false;
          this.dataSource = new MatTableDataSource<cortes>(success as cortes[]);
          this.dataSource.paginator = this.paginator;
          this.paginator.pageSize = 5;
          this.dataSource.sort = this.tablaCortesSort;
          this.openSnackBar('Se realizo la consulta de manera exitosa.', '✅', 3000);
        },
        (error: any) => {
          this.openSnackBar('Hubo un error al hcaer la consulta.', '⛔', 3000);
        });
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

    openDialogPermisos(): void {
      const dialogRol = this.dialog.open(this.dialogRoles);
    }

    oncloseDialog(): void {
      this.dialog.closeAll();

    }

    validaInformacion(dato: any): boolean {
      if (dato != undefined && dato != null && dato != '' && dato != "Invalid Date") {
        return true;
      }
      else {
        return false;
      }
    }


    detalle(detalle: string) {
      localStorage.setItem('datosTalon', JSON.stringify(detalle));
      const fechaInicio = this.formGroupFiltro.get('fechaInicio').value;
      const fechaFinal = this.formGroupFiltro.get('fechaFin').value;
      localStorage.setItem('filtro', JSON.stringify(detalle));
      this.router.navigate(['home/flete/DetallesCorte']);
    }

    obtenerIdOficina(): string {
      let idoficinaJson = JSON.parse(sessionStorage.getItem('usuario')!);
      return idoficinaJson.claveOficina;
    }

    buscar() {
      this.isLoading = true;
      const fechaInicio = this.formGroupFiltro.get('fechaInicio').value;
      const fechaFinal = this.formGroupFiltro.get('fechaFin').value;
      let oficina = this.obtenerIdOficina() === '1100' ? '1100' : this.obtenerIdOficina();
      const filtro = {
        "fechaInicio": fechaInicio,
        "fechaFin": fechaFinal,
        "oficina": oficina
      }
      if (this.obtenerIdOficina() == '1100') {
        this.consultaCorteService.getAllCortes(filtro).subscribe(
          (success: any) => {
            this.isLoading = false;
            console.log(success);
            this.dataSource = new MatTableDataSource<cortes>(success as cortes[]);
            this.dataSource.paginator = this.paginator;
            this.paginator.pageSize = 5;
            this.dataSource.sort = this.tablaCortesSort;
            this.openSnackBar('Se realizo la consulta de manera exitosa.', '✅', 3000);
          },
          (error: any) => {
            this.isLoading = false;
            this.openSnackBar('Hubo un error al hcaer la consulta.', '⛔', 3000);
          });
      } else {
        this.consultaCorteService.getCortesOficinas(filtro).subscribe(
          (success: any) => {
            console.log(success);
            this.isLoading = false;
            this.dataSource = new MatTableDataSource<cortes>(success as cortes[]);
            this.dataSource.paginator = this.paginator;
            this.paginator.pageSize = 5;
            this.dataSource.sort = this.tablaCortesSort;
            this.openSnackBar('Se realizo la consulta de manera exitosa.', '✅', 3000);
          },
          (error: any) => {
            this.isLoading = false;
            this.openSnackBar('Hubo un error al hcaer la consulta.', '⛔', 3000);
          });
      }
    }

    onFechaInicioChange(event: any) {
      return event.value;
    }

    onFechaFinChange(event: any) {
      return event.value;
    }

    createDateFilter(minDate: Date, maxDate: Date): (date: Date | null) => boolean {
      return (date: Date | null): boolean => {
        if (!date) return false;
        return date >= minDate && date <= maxDate;
      };
    }

  }

