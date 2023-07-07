import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InicioCastoresComponent } from './inicio-castores.component';

describe('InicioCastoresComponent', () => {
  let component: InicioCastoresComponent;
  let fixture: ComponentFixture<InicioCastoresComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InicioCastoresComponent]
    });
    fixture = TestBed.createComponent(InicioCastoresComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
