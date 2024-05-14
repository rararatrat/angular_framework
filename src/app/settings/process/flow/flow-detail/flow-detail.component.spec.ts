import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FlowDetailComponent } from './flow-detail.component';

describe('FlowDetailComponent', () => {
  let component: FlowDetailComponent;
  let fixture: ComponentFixture<FlowDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FlowDetailComponent]
    });
    fixture = TestBed.createComponent(FlowDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
