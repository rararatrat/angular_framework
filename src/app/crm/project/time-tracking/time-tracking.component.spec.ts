import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeTrackingComponent } from './time-tracking.component';

describe('TimeTrackingComponent', () => {
  let component: TimeTrackingComponent;
  let fixture: ComponentFixture<TimeTrackingComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TimeTrackingComponent]
    });
    fixture = TestBed.createComponent(TimeTrackingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
