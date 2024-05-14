import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConditionsDetailComponent } from './conditions-detail.component';

describe('ConditionsDetailComponent', () => {
  let component: ConditionsDetailComponent;
  let fixture: ComponentFixture<ConditionsDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ConditionsDetailComponent]
    });
    fixture = TestBed.createComponent(ConditionsDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
