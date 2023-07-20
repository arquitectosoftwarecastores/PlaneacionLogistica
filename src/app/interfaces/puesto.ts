import { Departamento } from './departamento';
import { Producto } from './producto';
export interface Puesto {
  idPuesto: number;
  nombre: string;
  idEstatusPuesto: number;
  departamento: Departamento;
  productoAutorizadoPuestos: Producto;
}
