import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChartXyComponent } from './chart-xy.component';

describe('ChartXyComponent', () => {
  let component: ChartXyComponent;
  let fixture: ComponentFixture<ChartXyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ChartXyComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ChartXyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
