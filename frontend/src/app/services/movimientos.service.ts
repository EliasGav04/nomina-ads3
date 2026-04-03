import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseService } from './base.service';
import { Movimiento } from '../interfaces/interface';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MovimientosService extends BaseService<Movimiento> {
  constructor(http: HttpClient) {
    super(http, `${environment.apiUrl}/movimientos`);
  }
}
