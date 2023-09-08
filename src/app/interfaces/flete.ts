import { Time } from "@angular/common";

export interface  flete_optimo  {
  idFleteOptimo : number;
  idOficina : string;
  idZona :number;
  cantidadFleteOptimo:number;
  estatus : number;
  idpersonal :number;
  fecha_mod :Date;
  hora_mod :Time;
  nombrePersonal:string;
  nombreZona:string;
  nombreOficina:string;
}
