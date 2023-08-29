import { Component, OnInit, ViewChild } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { DatosTalon } from 'src/app/interfaces/datosTalon';
import { consultaCorteService } from '../../../services/consultaCorte';
import { MatPaginator, MatPaginatorIntl } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Location } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomPaginator } from 'src/app/shared/paginator/custompaginator';

@Component({
  selector: 'app-detalles-corte',
  templateUrl: './detalles-corte.component.html',
  styleUrls: ['./detalles-corte.component.css'],
  providers: [
    { provide: MatPaginatorIntl, useValue: CustomPaginator() }
  ]
})
export class DetallesCorteComponent  implements OnInit{
  displayedColumns: string[] = ['claTalon', 'tipoTalon', 'flete', 'cdp', 'bulto', 'volumen', 'queContiene', 'documenta', 'origen', 'tipo', 'venta',
    'destino', 'tipoGuia', 'noEconomico'];
  corte!: string;
  descripcion!: string;
  fechaInicio!: string;
  fechaFin!: string;
  oficina!: string;
  hora!: string;
  tipoCorte!: string;
  isLoading: boolean = true;
  idCorte!:string;
  fleteSum: number = 0;
  public dataSource = new MatTableDataSource<DatosTalon>();
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild('tablaDetalleSort', { static: false }) set tablaDetalleSort(tablaDetalleSort: MatSort) {
    if (this.validaInformacion(tablaDetalleSort)) this.dataSource.sort = tablaDetalleSort;
  }

  constructor(public snackBar: MatSnackBar, private consultaCorteService: consultaCorteService, private location: Location, private router: ActivatedRoute, private route: Router) {
  }

  ngOnInit(): void {
    const datosTalonFromStorage = localStorage.getItem('datosTalon');
    this.router.params.subscribe((params: { [x: string]: any }) => {
      this.fechaInicio = params['fechaInicio'];
      this.fechaFin = params['fechaFin'];
      this.oficina = params['oficina'];
      this.idCorte=params['idCorte'];


      this.consultaCorteService.getFindbyCorte(this.idCorte!).subscribe(
        (success: any) => {
          this.isLoading = false;
          const tabla=success.descripcionTabla;
          const detalle = JSON.parse(tabla);
          this.corte = success.idCorte;
          this.descripcion = (success.accion === null) ? '' : success.accion;
          this.hora = success.horaMod;
          this.tipoCorte = success.nombreTipoVenta;
          this.dataSource = new MatTableDataSource<DatosTalon>(detalle as DatosTalon[]);
          this.dataSource.paginator = this.paginator;
          this.paginator.pageSize = 5;
          this.dataSource.sort = this.tablaDetalleSort;
          this.openSnackBar('Destalles del corte.', '✅', 3000);
        },
        (error: any) => {
          this.isLoading = false;
          this.openSnackBar('Hubo un error al hacer la consulta.', '⛔', 3000);
        });
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
  DocumentaFiltro = new FormControl();
  /**
    * applyFilter: Funcion para el filtrado de la tabla
    * @param fecha (string)
    * @return Date
    * @author Oswaldo Ramirez [desarrolloti43]
    * @date 2023-07-22
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
      const tipoTalonMatch = data.tipoTalon?.toLowerCase().includes(filtersObj.tipoTalon?.toLowerCase() || '');
      const fleteMatch = data.flete?.toString().toLowerCase().includes(filtersObj.flete?.toLowerCase() || '');
      const cdpMatch = data.cdp?.toString().toLowerCase().includes(filtersObj.cdp?.toLowerCase() || '');
      const bultoMatch = data.bulto?.toString().toLowerCase().includes(filtersObj.bulto?.toLowerCase() || '');
      const volumenMatch = data.volumen?.toString().toLowerCase().includes(filtersObj.volumen?.toLowerCase() || '');
      const documentaMatch = data.nombreOficinaDocumenta?.toLowerCase().includes(filtersObj.documenta?.toLowerCase() || '');
      const contieneMatch = data.queContiene?.toString().toLowerCase().includes(filtersObj.queContiene?.toLowerCase() || '');
      const origenMatch = data.origen?.toLowerCase().includes(filtersObj.origen?.toLowerCase() || '');
      const tipoMatch = data.tipo?.toLowerCase().includes(filtersObj.tipo?.toLowerCase() || '');
      const ventaMatch = data.venta?.toLowerCase().includes(filtersObj.venta?.toLowerCase() || '');
      const destinoMatch = data.destino?.toLowerCase().includes(filtersObj.destino?.toLowerCase() || '');
      const tipoGuiaMatch = data.tipoGuia?.toLowerCase().includes(filtersObj.tipoGuia?.toLowerCase() || '');
      const noEconomicoMatch = data.noEconomico?.toString().toLowerCase().includes(filtersObj.noEconomico?.toLowerCase() || '');
      return claTalonMatch && tipoTalonMatch && fleteMatch && cdpMatch && bultoMatch && volumenMatch && documentaMatch && contieneMatch && origenMatch && tipoMatch && ventaMatch && destinoMatch && tipoGuiaMatch && noEconomicoMatch;
    };
    this.dataSource.filter = JSON.stringify(filters);
  }

   /**
    * validaInformacion: Funcion para validar la informacion
    *
    * @param fecha (string)
    * @return Date
    * @author Oswaldo Ramirez [desarrolloti43]
    * @date 2023-07-22
   */

  validaInformacion(dato: any): boolean {
    return dato !== undefined && dato !== null && dato !== '' && dato !== "Invalid Date";
  }
/**
    * calcularSumatoria: Funcion para calcular la sumatoria de las columnas seleccionadas en el html
    *
    * @param fecha (string)
    * @return Date
    * @author Oswaldo Ramirez [desarrolloti43]
    * @date 2023-07-23
   */

  calcularSumatoria(columna: keyof DatosTalon): number {
    const talonesCorte = this.dataSource.filteredData;
    const sum = talonesCorte.slice().reduce((sum, currentRow) => {
      const value = currentRow[columna];
      return typeof value === 'number' ? sum + value : sum;
    }, 0);
    return parseFloat(sum.toFixed(2));
  }
  /**
    * openSnackBar: Funcion para ver los mensajes.
    *
    * @param fecha (string)
    * @return Date
    * @author Oswaldo Ramirez [desarrolloti43]
    * @date 2023-07-24
   */
  openSnackBar(message: string, action: string, tiempo: number): void {
    this.snackBar.open(message, action, {
      duration: tiempo
    });
  }

  /**
    * regresar: Funcion para regresar al modulo de consultaCorte
    *
    * @param fecha (string)
    * @return Date
    * @author Oswaldo Ramirez [desarrolloti43]
    * @date 2023-07-24
   */

  regresar() {
    this.route.navigate(['home/flete/consultaCorte/' + this.fechaInicio + '/' + this.fechaFin ]);
  }

  /**
    *removeAccents: Funcion para remover los acentos
    *
    * @param fecha (string)
    * @return Date
    * @author Oswaldo Ramirez [desarrolloti43]
    * @date 2023-07-24
   */
  removeAccents(text: string): string {
    return text.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
}
