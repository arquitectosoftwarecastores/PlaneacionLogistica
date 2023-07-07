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
import { FormControl, FormGroup } from '@angular/forms';

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
export class SateliteComponent {
  public permisoAInsertarAgregar: any = 0;
  private permisoBConsultar: any = 0;
  private permisoCEliminar: any = 0;
  public permisoDActualizar: any = 0;
  private permisoEAutorizar: any = 0;
  private permisoFRechazar: any = 0;
  private permisoHDescargar: any = 0;
  private permisoIImprimir: any = 0;
  public formGroupSatelite: any;

  nombrePerteneceFiltro = new FormControl('');
  sateliteFiltro = new FormControl('');
  estatusFiltro = new FormControl('');
  perosnalFiltro = new FormControl('');
  fechaModFiltro = new FormControl('');

  displayedColumns: string[] = ['nombrePertenece', 'nombreSatelite', 'estatus', 'idPersonal', 'fechaMod', 'modificar'];
  public dataSource = new MatTableDataSource<sucursales_satelite>();

  private datosEncontrados: any = [];
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('dialogModificar') dialogModificar!: TemplateRef<any>;
  @ViewChild('dialogAgregar') dialogAgregar!: TemplateRef<any>;
  @ViewChild('tablaSateliteSort', { static: false }) set tablaSateliteSort(tablaSateliteSort: MatSort) {
    if (this.validaInformacion(tablaSateliteSort)) this.dataSource.sort = tablaSateliteSort;
  }

  constructor(public dialog: MatDialog, private activatedRoute: ActivatedRoute, private sateliteService: sateliteService,
    public snackBar: MatSnackBar, private router: Router, private authService: AuthService,
    private oficinaService: oficinasService) {
      this.formGroupSatelite = new FormGroup({
        idSucursal: new FormControl(''),
        idSatelite: new FormControl(''),
        estatusSatelite: new FormControl('')
    });

    const SISTEMA: number = 14;
    const MODULO: number = 90;

    let obtienePermisosG = this.authService.validaPermisosGlobales(SISTEMA, MODULO);
    console.log(obtienePermisosG)
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
          this.sateliteService.getAllSatelite().subscribe(response => {
            console.log("resultado");
            console.log(response);
            this.dataSource = new MatTableDataSource<sucursales_satelite>(response as sucursales_satelite[]);
            this.dataSource.filterPredicate = this.createFilter();
            this.dataSource.data.forEach(item => {
              //Aqui va el personal
            });
            this.dataSource.sort = this.tablaSateliteSort;
          })
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
  filterValues = {
    nombrePertenece: '',
    nombreSatelite: '',
    estatus: '',
    idPersonal: '',
    fechaMod: ''
  };


  openDialogPermisos(): void {
    const dialogRol = this.dialog.open(this.dialogAgregar);

    dialogRol.afterClosed().subscribe(result => {
      console.log('El modal se ha cerrado');
    });
  }

  oncloseDialog(): void {
    this.dialog.closeAll();

  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;

    this.nombrePerteneceFiltro.valueChanges
      .subscribe(
        nombrePertenece => {
          this.filterValues.nombrePertenece = nombrePertenece!;
          this.dataSource.filter = JSON.stringify(this.filterValues).toLowerCase();
        }
      )
    this.sateliteFiltro.valueChanges
      .subscribe(
        nombreSatelite => {
          this.filterValues.nombreSatelite = nombreSatelite!;
          this.dataSource.filter = JSON.stringify(this.filterValues).toLowerCase();
        }
      )
    this.estatusFiltro.valueChanges
      .subscribe(
        estatus => {
          this.filterValues.estatus = estatus!;
          this.dataSource.filter = JSON.stringify(this.filterValues).toLowerCase();
        }
      )
    this.perosnalFiltro.valueChanges
      .subscribe(
        idPersonal => {
          this.filterValues.idPersonal = idPersonal!;
          this.dataSource.filter = JSON.stringify(this.filterValues).toLowerCase();
        }
      )
    this.fechaModFiltro.valueChanges
      .subscribe(
        fechaMod => {
          this.filterValues.fechaMod = fechaMod!;
          this.dataSource.filter = JSON.stringify(this.filterValues).toLowerCase();
        }
      )
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

  createFilter(): (data: any, filter: string) => boolean {
    let filterFunction = function (data: { nombrePertenece: string; nombreSatelite: string; estatus: string; idPersonal: string; fechaMod: string; }, filter: string): boolean {
      let searchTerms = JSON.parse(filter);
      console.log(filter);
      console.log(searchTerms);
      return data.nombrePertenece.toLowerCase().indexOf(searchTerms.nombrepertenece) !== -1
        && data.nombreSatelite.toLowerCase().indexOf(searchTerms.nombresatelite) !== -1
        && data.estatus.toString().toLowerCase().indexOf(searchTerms.estatus) !== -1
        && data.idPersonal.toString().toLowerCase().indexOf(searchTerms.idpersonal) !== -1
        && data.fechaMod.toLowerCase().indexOf(searchTerms.fechamod) !== -1;
    }
    return filterFunction;
  }

  validaInformacion(dato: any): boolean {
    if (dato != undefined && dato != null && dato != '' && dato != "Invalid Date") {
      return true;
    }
    else {
      return false;
    }
  }
  guardarSatelite() {
    const agregar = {
      sucursal:this.formGroupSatelite.idSucursal,
      satelite:this.formGroupSatelite.idSatelite,
      estatus:this.formGroupSatelite.estatusSatelite
    };
    console.log(agregar);
    /*this.sateliteService.setSatelite(agregar).subscribe(
      (success: any) => {

      },
      (error: any) => {

      });*/
  }

}

