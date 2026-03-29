import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmpleadoConceptosComponent } from './empleado-conceptos.component';

describe('EmpleadoConceptosComponent', () => {
  let component: EmpleadoConceptosComponent;
  let fixture: ComponentFixture<EmpleadoConceptosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmpleadoConceptosComponent]
    });
    fixture = TestBed.createComponent(EmpleadoConceptosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
