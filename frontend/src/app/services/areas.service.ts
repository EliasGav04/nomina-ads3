import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BaseService } from './base.service';
import { Area } from '../interfaces/interface';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AreasService extends BaseService<Area> {
  constructor(http: HttpClient) {
    super(http, `${environment.apiUrl}/areas`);
  }
}
