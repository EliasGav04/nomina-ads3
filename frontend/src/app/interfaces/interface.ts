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