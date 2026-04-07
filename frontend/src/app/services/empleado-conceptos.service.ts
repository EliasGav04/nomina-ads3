import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseService } from './base.service';
import { EmpleadoConcepto } from '../interfaces/interface';
import { environment } from 'src/environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmpleadoConceptosService extends BaseService<EmpleadoConcepto> {
  constructor(http: HttpClient) {
    super(http, `${environment.apiUrl}/empleado-conceptos`);
  }

  deleteConFecha(
    id: number,
    payload: { modo: 'no_aplicar_periodo_abierto' | 'fin_periodo_abierto' }
  ): Observable<any> {
    return this.http.request('delete', `${environment.apiUrl}/empleado-conceptos/${id}`, { body: payload });
  }
}
