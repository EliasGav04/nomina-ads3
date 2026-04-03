import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseService } from './base.service';
import { Concepto } from '../interfaces/interface';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ConceptosService extends BaseService<Concepto> {
  constructor(http: HttpClient) {
    super(http, `${environment.apiUrl}/conceptos`);
  }

  getManualesActivos() {
    return this.http.get<Concepto[]>(`${environment.apiUrl}/conceptos/manuales-activos`);
  }
}
