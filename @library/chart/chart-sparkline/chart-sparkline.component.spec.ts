import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartSparklineComponent } from './chart-sparkline.component';

describe('ChartSparklineComponent', () => {
  let component: ChartSparklineComponent;
  let fixture: ComponentFixture<ChartSparklineComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChartSparklineComponent]
    });
    fixture = TestBed.createComponent(ChartSparklineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
