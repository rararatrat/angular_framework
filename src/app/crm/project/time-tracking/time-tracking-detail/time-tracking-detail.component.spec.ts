import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeTrackingDetailComponent } from './time-tracking-detail.component';

describe('TimeTrackingDetailComponent', () => {
  let component: TimeTrackingDetailComponent;
  let fixture: ComponentFixture<TimeTrackingDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TimeTrackingDetailComponent]
    });
    fixture = TestBed.createComponent(TimeTrackingDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
