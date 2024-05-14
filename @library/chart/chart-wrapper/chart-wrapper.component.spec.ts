import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartWrapperComponent } from './chart-wrapper.component';

describe('ChartWrapperComponent', () => {
  let component: ChartWrapperComponent;
  let fixture: ComponentFixture<ChartWrapperComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ChartWrapperComponent]
    });
    fixture = TestBed.createComponent(ChartWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
