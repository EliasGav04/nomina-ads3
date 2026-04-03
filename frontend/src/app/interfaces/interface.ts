export interface Rol {
  id_rol: number; 
  rol: string;             
}

export interface Usuario {
  id_rol: any;
  Rol: any;
  id_usuario: number; 
  usuario: string;        
  clave_hash: string;    
  ultimo_acceso: string;
  estado: string;  
  createdAt: string;       
  updatedAt: string;        
}

export interface Infoempresa {
  id_empresa: number;
  nombre: string;
  razon_social: string;
  rtn: string;
  direccion: string;
  telefono: string;
  correo: string;
  sitio_web: string;
  logo?: Blob;     
  logo_mime?: string;
  logoBase64?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Area {
  id_area: number;
  area: string;
  estado: string;
  createdAt: string;
  updatedAt: string;
}

export interface Concepto {
  id_concepto: number;
  concepto: string;
  tipo: 'ingreso' | 'deduccion';
  naturaleza: 'fijo' | 'porcentaje' | 'manual';
  valor_defecto: number;
  es_global: boolean;
  estado: string;
  createdAt: string;
  updatedAt: string;
}

export interface Empleado {
  id_empleado: number;
  dni: string;
  nombre_completo: string;
  cargo: string;
  fecha_ingreso: string; 
  numero_ihss: string;
  cta_bancaria: string;
  estado: string;
  id_area: number;
  createdAt: string;
  updatedAt: string;

  Area?: {
    id_area: number;
    area: string;
  };
}

export interface EmpleadoConcepto {
  id_empleado_concepto: number;
  id_empleado: number;
  id_concepto: number;
  valor: number;
  fecha_desde: string;
  fecha_hasta: string | null;
  createdAt: string;
  updatedAt: string;

  Empleado?: {
    id_empleado: number;
    nombre_completo: string;
  };
  Concepto?: {
    id_concepto: number;
    concepto: string;
    tipo: string;
    naturaleza: string;
  };

}


export interface Periodo {
  id_periodo: number;
  periodo: string;
  fecha_inicio: string;
  fecha_final: string;
  fecha_pago: string;
  estado: 'Abierto' | 'Procesado' | 'Cerrado';
  createdAt: string;
  updatedAt: string;

  empleados?: number;
}
