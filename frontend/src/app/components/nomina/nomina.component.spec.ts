import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NominaComponent } from './nomina.component';

describe('NominaComponent', () => {
  let component: NominaComponent;
  let fixture: ComponentFixture<NominaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [NominaComponent]
    });
    fixture = TestBed.createComponent(NominaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
