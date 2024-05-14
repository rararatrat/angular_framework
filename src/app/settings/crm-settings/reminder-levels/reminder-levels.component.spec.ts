import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReminderLevelsComponent } from './reminder-levels.component';

describe('ReminderLevelsComponent', () => {
  let component: ReminderLevelsComponent;
  let fixture: ComponentFixture<ReminderLevelsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReminderLevelsComponent]
    });
    fixture = TestBed.createComponent(ReminderLevelsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
