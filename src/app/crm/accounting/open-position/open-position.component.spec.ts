import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OpenPositionComponent } from './open-position.component';

describe('OpenPositionComponent', () => {
  let component: OpenPositionComponent;
  let fixture: ComponentFixture<OpenPositionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OpenPositionComponent]
    });
    fixture = TestBed.createComponent(OpenPositionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
