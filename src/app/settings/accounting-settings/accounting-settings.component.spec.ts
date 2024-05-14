import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccountingSettingsComponent } from './accounting-settings.component';

describe('AccountingSettingsComponent', () => {
  let component: AccountingSettingsComponent;
  let fixture: ComponentFixture<AccountingSettingsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AccountingSettingsComponent]
    });
    fixture = TestBed.createComponent(AccountingSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
