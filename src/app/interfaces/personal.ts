import { Puesto } from './puesto';
export interface Personal {
  idPersonal: number;
  nombre: string;
  apellidoPaterno: string;
  apellidoMaterno: string;
  nombreCompleto: string;
  puesto: Puesto;
  usuario: number;
}
