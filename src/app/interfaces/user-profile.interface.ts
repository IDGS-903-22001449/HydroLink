export interface UserProfileDto {

  id?: string;
  email?: string;
  fullName?: string;
  roles?: string[];
  phoneNumber?: string;
  phoneNumberConfirmed?: boolean;
  accessFailedCount?: number;


  clienteId?: number;
  nombre?: string;
  apellido?: string;
  telefono?: string;
  direccion?: string;
  empresa?: string;
  tipoPersona?: string;
  fechaRegistro?: Date;
  activo?: boolean;
}

export interface UpdateProfileDto {
  nombre: string;
  apellido: string;
  telefono?: string;
  direccion?: string;
  empresa?: string;
  fullName: string;
  phoneNumber?: string;
}
