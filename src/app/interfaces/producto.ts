
export class Producto {
  idProductoAutorizado!: number;
  nombre!: string;
  descripcion!: string;
  fechaRegistro?: Date;
  fechaModificacion?: Date;
  idUsuarioModificacion!: number;
  idEstatusProductoAutorizado!: number;
  idTipoProductoAutorizado!: number;
  autorizacionAutomatica!: number;
}
