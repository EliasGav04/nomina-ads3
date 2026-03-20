import { TestBed } from '@angular/core/testing';

import { InfoempresaService } from './infoempresa.service';

describe('InfoempresaService', () => {
  let service: InfoempresaService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InfoempresaService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
