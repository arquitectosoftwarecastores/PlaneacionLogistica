export interface DatosTalon {
  claTalon: string;
  tpdc: number;
  tipoTalon: string;
  flete: number;
  cdp: number;
  bulto: number;
  volumen: number;
  queContiene: string;
  idOrigen: string;
  origen: string;
  tipo: string;
  venta: string;
  idDestino: number;
  destino: string;
  ocurre: number;
  noGuia: string;
  idTipoGuia: number;
  tipoGuia: string;
  unidad: number;
  noEconomico: string;
  fecha: Date; // Para usar LocalDate, podemos utilizar la clase Date de JavaScript
  hora: Date; // Para usar LocalTime, podemos utilizar la clase Date de JavaScript
}
