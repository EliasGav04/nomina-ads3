import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

export interface DashboardResumen {
  total_empleados: number;
  nomina_mes: number;
  periodo_actual: {
    id_periodo: number;
    periodo: string;
    estado: string;
  } | null;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  constructor(private http: HttpClient) {}

  getResumen() {
    return this.http.get<DashboardResumen>(`${environment.apiUrl}/dashboard/resumen`);
  }
}
