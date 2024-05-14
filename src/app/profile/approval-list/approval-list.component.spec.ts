import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovalListComponent } from './approval-list.component';

describe('ApprovalListComponent', () => {
  let component: ApprovalListComponent;
  let fixture: ComponentFixture<ApprovalListComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ApprovalListComponent]
    });
    fixture = TestBed.createComponent(ApprovalListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
