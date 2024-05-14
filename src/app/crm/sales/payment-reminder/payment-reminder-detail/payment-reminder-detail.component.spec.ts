import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PaymentReminderDetailComponent } from './payment-reminder-detail.component';

describe('PaymentReminderDetailComponent', () => {
  let component: PaymentReminderDetailComponent;
  let fixture: ComponentFixture<PaymentReminderDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PaymentReminderDetailComponent]
    });
    fixture = TestBed.createComponent(PaymentReminderDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
