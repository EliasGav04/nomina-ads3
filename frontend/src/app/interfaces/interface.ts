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