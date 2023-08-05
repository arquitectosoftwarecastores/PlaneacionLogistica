import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DetallesCorteComponent } from './detalles-corte.component';

describe('DetallesCorteComponent', () => {
  let component: DetallesCorteComponent;
  let fixture: ComponentFixture<DetallesCorteComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DetallesCorteComponent]
    });
    fixture = TestBed.createComponent(DetallesCorteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
