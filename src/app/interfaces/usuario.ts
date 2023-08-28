import { Personal } from './personal';
export interface Usuario {
  idUsuario: number;
  usuario: string;
  personal: Personal;
  menu: any;
}
