import { Puesto } from './puesto';
export class Personal {
  idPersonal: number;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombreCompleto: string;
  puesto: Puesto;
  usuario?: number;
}
