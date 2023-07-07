import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AltaUsuariosComponent } from './alta-usuarios.component';

describe('AltaUsuariosComponent', () => {
  let component: AltaUsuariosComponent;
  let fixture: ComponentFixture<AltaUsuariosComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AltaUsuariosComponent]
    });
    fixture = TestBed.createComponent(AltaUsuariosComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
