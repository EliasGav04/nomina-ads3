import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseService } from './base.service';
import { Rol } from '../interfaces/interface';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RolesService extends BaseService<Rol> {
  constructor(http: HttpClient) {
    super(http, `${environment.apiUrl}/roles`);
  }
  
  findByNombre(nombre: string) {
    return this.http.get<Rol[]>(`${environment.apiUrl}/roles?rol=${nombre}`);
  }
}
