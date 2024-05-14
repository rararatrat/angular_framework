import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GeneralStatusComponent } from './general-status.component';

describe('BusinessActivitiesComponent', () => {
  let component: GeneralStatusComponent;
  let fixture: ComponentFixture<GeneralStatusComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [GeneralStatusComponent]
    });
    fixture = TestBed.createComponent(GeneralStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
