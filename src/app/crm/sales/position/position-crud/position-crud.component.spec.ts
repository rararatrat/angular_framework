import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PositionCrudComponent } from './position-crud.component';

describe('PositionCrudComponent', () => {
  let component: PositionCrudComponent;
  let fixture: ComponentFixture<PositionCrudComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PositionCrudComponent]
    });
    fixture = TestBed.createComponent(PositionCrudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
