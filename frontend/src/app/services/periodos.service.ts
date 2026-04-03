import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseService } from './base.service';
import { Periodo } from '../interfaces/interface';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PeriodosService extends BaseService<Periodo> {
  constructor(http: HttpClient) {
    super(http, `${environment.apiUrl}/periodos`);
  }
}
