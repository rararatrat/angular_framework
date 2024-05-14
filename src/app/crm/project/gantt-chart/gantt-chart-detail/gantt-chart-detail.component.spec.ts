import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GanttChartDetailComponent } from './gantt-chart-detail.component';

describe('GanttChartDetailComponent', () => {
  let component: GanttChartDetailComponent;
  let fixture: ComponentFixture<GanttChartDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GanttChartDetailComponent]
    });
    fixture = TestBed.createComponent(GanttChartDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
