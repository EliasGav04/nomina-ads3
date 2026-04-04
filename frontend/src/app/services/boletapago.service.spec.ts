import { TestBed } from '@angular/core/testing';

import { BoletapagoService } from './boletapago.service';

describe('BoletapagoService', () => {
  let service: BoletapagoService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BoletapagoService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
