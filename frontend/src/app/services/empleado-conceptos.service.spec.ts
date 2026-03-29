import { TestBed } from '@angular/core/testing';

import { EmpleadoConceptosService } from './empleado-conceptos.service';

describe('EmpleadoConceptosService', () => {
  let service: EmpleadoConceptosService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EmpleadoConceptosService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
