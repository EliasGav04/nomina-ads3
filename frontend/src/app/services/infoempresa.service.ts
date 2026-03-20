import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseService } from './base.service';
import { Infoempresa } from '../interfaces/interface';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class InfoempresaService extends BaseService<Infoempresa> {
  constructor(http: HttpClient) {
    super(http, `${environment.apiUrl}/infoempresa`);
  }

  createWithFormData(data: FormData) {
    return this.http.post<Infoempresa>(`${environment.apiUrl}/infoempresa`, data);
  }

  updateWithFormData(id: number, data: FormData) {
    return this.http.put<Infoempresa>(`${environment.apiUrl}/infoempresa/${id}`, data);
  }
}
