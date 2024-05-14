import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReminderLevelsDetailComponent } from './reminder-levels-detail.component';

describe('ReminderLevelsDetailComponent', () => {
  let component: ReminderLevelsDetailComponent;
  let fixture: ComponentFixture<ReminderLevelsDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ReminderLevelsDetailComponent]
    });
    fixture = TestBed.createComponent(ReminderLevelsDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
