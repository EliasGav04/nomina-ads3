import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Empleado, Periodo } from '../interfaces/interface';

export interface EstadoNomina {
  estado: string;
  empleadosValidados: boolean;
  movimientosRegistrados: boolean;
  calculoPendiente: boolean;
  aprobacionPendiente: boolean;
}

export interface EmpleadosProcesarResponse {
  total: number;
  empleados: Empleado[];
}

@Injectable({
  providedIn: 'root'
})
export class NominaService {
  private apiUrl = `${environment.apiUrl}/nomina`;

  constructor(private http: HttpClient) {}

  getPeriodosAbiertos() {
    return this.http.get<Periodo[]>(`${this.apiUrl}/periodos-abiertos`);
  }

  getEstadoActual(idPeriodo: number) {
    return this.http.get<EstadoNomina>(`${this.apiUrl}/estado/${idPeriodo}`);
  }

  getEmpleadosProcesar(idPeriodo: number, idArea?: number | null) {
    let params = new HttpParams().set('id_periodo', String(idPeriodo));
    if (idArea) params = params.set('id_area', String(idArea));
    return this.http.get<EmpleadosProcesarResponse>(`${this.apiUrl}/empleados-procesar`, { params });
  }

  ejecutarNomina(idPeriodo: number) {
    return this.http.post<{ message: string }>(`${this.apiUrl}/ejecutar`, { id_periodo: idPeriodo });
  }
}
