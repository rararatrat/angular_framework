import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PositionWrapperComponent } from './position-wrapper.component';

describe('PositionWrapperComponent', () => {
  let component: PositionWrapperComponent;
  let fixture: ComponentFixture<PositionWrapperComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PositionWrapperComponent]
    });
    fixture = TestBed.createComponent(PositionWrapperComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
