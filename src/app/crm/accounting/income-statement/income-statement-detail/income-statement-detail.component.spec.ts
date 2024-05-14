import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IncomeStatementDetailComponent } from './income-statement-detail.component';

describe('IncomeStatementDetailComponent', () => {
  let component: IncomeStatementDetailComponent;
  let fixture: ComponentFixture<IncomeStatementDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [IncomeStatementDetailComponent]
    });
    fixture = TestBed.createComponent(IncomeStatementDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
