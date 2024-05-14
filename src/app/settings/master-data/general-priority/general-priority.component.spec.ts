import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralPriorityComponent } from './general-priority.component';

describe('GeneralPriorityComponent', () => {
  let component: GeneralPriorityComponent;
  let fixture: ComponentFixture<GeneralPriorityComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GeneralPriorityComponent]
    });
    fixture = TestBed.createComponent(GeneralPriorityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
