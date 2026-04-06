import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';

export type TipoReporte = 'planilla_general' | 'nomina_por_area' | 'anual_general';

export interface ReportePeriodo {
  id_periodo: number;
  periodo: string;
  fecha_inicio: string;
  fecha_final: string;
  fecha_pago: string;
}

export interface ReporteArea {
  id_area: number;
  area: string;
}

export interface ReporteResponse {
  tipo: TipoReporte;
  empresa: {
    id_empresa: number;
    nombre: string;
    razon_social: string;
    rtn: string;
    direccion: string;
    telefono: string;
    correo: string;
    sitio_web: string;
    codigo_moneda: string;
    logoBase64: string | null;
  } | null;
  meta: {
    periodo: string;
    area: string;
    total_empleados: number;
    fecha_generacion: string;
  };
  resumen: {
    salario_base: number;
    ingresos: number;
    deducciones: number;
    neto: number;
  };
  rows: any[];
}

@Injectable({
  providedIn: 'root'
})
export class ReportesService {
  private apiUrl = `${environment.apiUrl}/reportes`;

  constructor(private http: HttpClient) {}

  getConfig() {
    return this.http.get<{ periodos: ReportePeriodo[]; areas: ReporteArea[] }>(`${this.apiUrl}/config`);
  }

  generar(tipo: TipoReporte, idPeriodo?: number | null, idArea?: number | null) {
    let params = new HttpParams().set('tipo', tipo);
    if (idPeriodo) params = params.set('id_periodo', String(idPeriodo));
    if (idArea) params = params.set('id_area', String(idArea));
    return this.http.get<ReporteResponse>(`${this.apiUrl}/generar`, { params });
  }
}
