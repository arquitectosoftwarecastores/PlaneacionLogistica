
import { Time } from "@angular/common";
export interface cortes {
  id_corte  : number;
  id_oficina : string;
  tipo_corte : string;
  descripcion_tabla : string;
  estatus : number;
  idpersonal :number;
  fecha_mod :Date;
  hora_mod :Time;
}
