import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OtpTokenComponent } from './otp-token.component';

describe('OtpTokenComponent', () => {
  let component: OtpTokenComponent;
  let fixture: ComponentFixture<OtpTokenComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ OtpTokenComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OtpTokenComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
