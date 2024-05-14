import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnitsComponent } from './units.component';

describe('UnitsComponent', () => {
  let component: UnitsComponent;
  let fixture: ComponentFixture<UnitsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [UnitsComponent]
    });
    fixture = TestBed.createComponent(UnitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
