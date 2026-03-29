import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseService } from './base.service';
import { EmpleadoConcepto } from '../interfaces/interface';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class EmpleadoConceptosService extends BaseService<EmpleadoConcepto> {
  constructor(http: HttpClient) {
    super(http, `${environment.apiUrl}/empleado-conceptos`);
  }
}
