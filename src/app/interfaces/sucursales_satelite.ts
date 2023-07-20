import { Time } from "@angular/common";
export interface sucursales_satelite  {
  idSucursalSatelite : number;
  idOficinaSatelite : string;
  idOficinaPertenece: string;
  nombrePertenece:string;
  estatus: number;
  idpersonal:number;
  nombrePersonal:string;
  nombreSatelite:string;
  fechaMod:Date;
  horaMod:Time;
}
