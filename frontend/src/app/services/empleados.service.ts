import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseService } from './base.service';
import { Empleado } from '../interfaces/interface';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmpleadosService extends BaseService<Empleado> {
  constructor(http: HttpClient) {
    super(http, `${environment.apiUrl}/empleados`);
  }

  getActivos() {
    return this.http.get<Empleado[]>(`${environment.apiUrl}/empleados/activos`);
  }
}
