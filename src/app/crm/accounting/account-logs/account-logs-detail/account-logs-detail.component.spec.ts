import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountLogsDetailComponent } from './account-logs-detail.component';

describe('AccountLogsDetailComponent', () => {
  let component: AccountLogsDetailComponent;
  let fixture: ComponentFixture<AccountLogsDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AccountLogsDetailComponent]
    });
    fixture = TestBed.createComponent(AccountLogsDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
