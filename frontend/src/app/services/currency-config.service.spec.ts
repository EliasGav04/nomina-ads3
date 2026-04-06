import { TestBed } from '@angular/core/testing';

import { CurrencyConfigService } from './currency-config.service';

describe('CurrencyConfigService', () => {
  let service: CurrencyConfigService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CurrencyConfigService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
