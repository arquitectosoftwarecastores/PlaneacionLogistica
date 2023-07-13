export class Usuario {
  id!:number;
  idUsuario!:string;
  idPersonal!:string;
  idPuesto!:string;
  idOficina!: string;
  plazaOficina!:string;
  claveOficina!: string;
  prefijoOficina!: string;
  username!:string;
  password!: string;
  nombre!: string;
  nombreCompleto!: string;
  apellido!: string;
  menu!: string;
  permisos: string[] = [];
  roles: string[] = [];
  idDepartamento!: number;
  departamento!: string;
  expiresIn!: string;
  ultimoAcceso!: string;
}
