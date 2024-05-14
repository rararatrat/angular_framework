import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BusinessActivitiesComponent } from './business-activities.component';

describe('BusinessActivitiesComponent', () => {
  let component: BusinessActivitiesComponent;
  let fixture: ComponentFixture<BusinessActivitiesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BusinessActivitiesComponent]
    });
    fixture = TestBed.createComponent(BusinessActivitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
