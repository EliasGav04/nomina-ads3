import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';

export interface FiltroEmpleado {
  id_empleado: number;
  dni: string;
  nombre_completo: string;
  cargo: string;
}

export interface FiltroPeriodo {
  id_periodo: number;
  periodo: string;
  fecha_inicio: string;
  fecha_final: string;
  fecha_pago: string;
  estado: string;
}

export interface BoletaResponse {
  empresa: {
    id_empresa: number;
    nombre: string;
    razon_social: string;
    rtn: string;
    direccion: string;
    telefono: string;
    correo: string;
    sitio_web: string;
    logoBase64: string | null;
  } | null;
  empleado: {
    id_empleado: number;
    dni: string;
    nombre_completo: string;
    cargo: string;
    numero_ihss: string;
    cta_bancaria: string;
    area: string | null;
  };
  periodo: {
    id_periodo: number;
    periodo: string;
    fecha_inicio: string;
    fecha_final: string;
    fecha_pago: string;
    estado: string;
  };
  ingresos: Array<{ concepto: string; naturaleza: string; monto: number }>;
  deducciones: Array<{ concepto: string; naturaleza: string; monto: number }>;
  resumen: {
    salario_base: number;
    total_ingresos: number;
    total_deducciones: number;
    salario_neto: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class BoletapagoService {
  private apiUrl = `${environment.apiUrl}/boleta-pago`;

  constructor(private http: HttpClient) {}

  getFiltros() {
    return this.http.get<{ empleados: FiltroEmpleado[]; periodos: FiltroPeriodo[] }>(
      `${this.apiUrl}/filtros`
    );
  }

  getBoleta(idEmpleado: number, idPeriodo: number) {
    const params = new HttpParams()
      .set('id_empleado', String(idEmpleado))
      .set('id_periodo', String(idPeriodo));

    return this.http.get<BoletaResponse>(this.apiUrl, { params });
  }
}
