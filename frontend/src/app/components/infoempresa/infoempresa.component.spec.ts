import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoempresaComponent } from './infoempresa.component';

describe('InfoempresaComponent', () => {
  let component: InfoempresaComponent;
  let fixture: ComponentFixture<InfoempresaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InfoempresaComponent]
    });
    fixture = TestBed.createComponent(InfoempresaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
