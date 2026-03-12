import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseService } from './base.service';
import { Usuario } from '../interfaces/interface';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsuariosService extends BaseService<Usuario> {
  constructor(http: HttpClient) {

    super(http, `${environment.apiUrl}/usuarios`);
  }

  findByNombre(nombre: string) {
    return this.http.get<Usuario[]>(`${environment.apiUrl}/usuarios?usuario=${nombre}`);
  }
}
