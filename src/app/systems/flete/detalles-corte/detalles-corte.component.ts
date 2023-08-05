import { Component, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DatosTalon } from 'src/app/interfaces/datosTalon';
import { consultaCorteService } from '../../../services/consultaCorte';
import { MatPaginator } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Location } from '@angular/common';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-detalles-corte',
  templateUrl: './detalles-corte.component.html',
  styleUrls: ['./detalles-corte.component.css']
})
export class DetallesCorteComponent {
  displayedColumns: string[] = ['claTalon', 'tipoTalon', 'flete', 'cdp', 'bulto', 'volumen', 'queContiene','documenta', 'origen', 'tipo', 'venta',
    'destino', 'tipoGuia', 'noEconomico'];
    corte!:string;
    descripcion!:string;
    fechaInicio!:string;
    fechaFin!:string;
    oficina!:string;
    hora!:string;
    tipoCorte!:string;
    isLoading: boolean = true;

  public dataSource = new MatTableDataSource<DatosTalon>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('tablaDetalleSort', { static: false }) set tablaDetalleSort(tablaDetalleSort: MatSort) {
    if (this.validaInformacion(tablaDetalleSort)) this.dataSource.sort = tablaDetalleSort;
  }
  constructor(public snackBar: MatSnackBar, private consultaCorteService: consultaCorteService, private location: Location,private router: ActivatedRoute) {
    const datosTalonFromStorage = localStorage.getItem('datosTalon');
    console.log(datosTalonFromStorage);
    this.consultaCorteService.getFindbyCorte(datosTalonFromStorage!).subscribe(
      (success: any) => {
        this.isLoading = false;
        const detalle = JSON.parse(success.descripcionTabla);
        this.corte=success.idCorte;
        this.descripcion=success.accion;
        this.fechaInicio=success.fechaMod;
        this.hora=success.horaMod;
        this.tipoCorte=success.nombreTipoVenta;
        console.log(success);
        this.dataSource = new MatTableDataSource<DatosTalon>(detalle as DatosTalon[]);
        this.dataSource.paginator = this.paginator;
        this.paginator.pageSize = 5;
        this.dataSource.sort = this.tablaDetalleSort;
        this.openSnackBar('Se realizo la consulta de manera exitosa.', '✅', 3000);
      },
      (error: any) => {
        this.isLoading = false;
        this.openSnackBar('Hubo un error al hacer la consulta.', '⛔', 3000);
      });


    if (datosTalonFromStorage) {
      this.dataSource = new MatTableDataSource<DatosTalon>(JSON.parse(datosTalonFromStorage));
    } else {
      this.dataSource = new MatTableDataSource<DatosTalon>([]);
    }

    this.router.params.subscribe((params: { [x: string]: any; }) => {
      this.fechaInicio = params['fechaInicio'];
      this.fechaFin = params['fechaFin'];
      this.oficina = params['oficina'];
    });
  }


  numeroTalonFiltro = new FormControl();
  tipoTalonFiltro = new FormControl();
  fleteFiltro = new FormControl();
  cdpFiltro = new FormControl();
  bultosFiltro = new FormControl();
  valumenFiltro = new FormControl();
  contieneFiltro = new FormControl();
  origenFiltro = new FormControl();
  tipoFiltro = new FormControl();
  ventaFiltro = new FormControl();
  destinoFiltro = new FormControl();
  tipoGuiaFiltro = new FormControl();
  noEconomicoFiltro = new FormControl();
  DocumentaFiltro=new FormControl();

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
      documenta:this.DocumentaFiltro.value,
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
      const documentaMatch = data.nombreOficinaDocumenta?.toLowerCase().includes(filtersObj.documenta?.toLowerCase() || '');
      const origenMatch = data.origen?.toLowerCase().includes(filtersObj.origen?.toLowerCase() || '');
      const tipoMatch = data.tipo?.toLowerCase().includes(filtersObj.tipo?.toLowerCase() || '');
      const ventaMatch = data.venta?.toLowerCase().includes(filtersObj.venta?.toLowerCase() || '');
      const destinoMatch = data.destino?.toLowerCase().includes(filtersObj.destino?.toLowerCase() || '');
      const tipoGuiaMatch = data.tipoGuia?.toLowerCase().includes(filtersObj.tipoGuia?.toLowerCase() || '');
      const noEconomicoMatch = data.noEconomico?.toString().toLowerCase().includes(filtersObj.noEconomico?.toLowerCase() || '');

      return claTalonMatch && tipoTalonMatch && fleteMatch && cdpMatch && bultoMatch && volumenMatch && documentaMatch && origenMatch && tipoMatch && ventaMatch && destinoMatch && tipoGuiaMatch && noEconomicoMatch;
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
  calcularSumatoria(columna: keyof DatosTalon): number {
    return this.dataSource.filteredData.slice().reduce((sum, currentRow) => {
      const value = currentRow[columna];
      return typeof value === 'number' ? sum + value : sum;
    }, 0);
  }

  openSnackBar(message: string, action: string, tiempo: number): void {
    this.snackBar.open(message, action, {
      duration: tiempo
    });
  }
  regresar(){
    this.router.navigate(['home/flete/DetallesCorte',this.fechaInicio,this.fechaFin,this.oficina]);
  }
}
