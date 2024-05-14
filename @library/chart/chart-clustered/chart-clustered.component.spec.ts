import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartClusteredComponent } from './chart-clustered.component';

describe('ChartClusteredComponent', () => {
  let component: ChartClusteredComponent;
  let fixture: ComponentFixture<ChartClusteredComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChartClusteredComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChartClusteredComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
