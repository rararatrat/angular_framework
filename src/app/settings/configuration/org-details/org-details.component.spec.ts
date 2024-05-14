import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrgDetailsComponent } from './org-details.component';

describe('OrgDetailsComponent', () => {
  let component: OrgDetailsComponent;
  let fixture: ComponentFixture<OrgDetailsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OrgDetailsComponent]
    });
    fixture = TestBed.createComponent(OrgDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
