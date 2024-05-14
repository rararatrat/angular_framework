import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VerifyPasswordComponent } from './verify-password.component';

describe('VerifyPasswordComponent', () => {
  let component: VerifyPasswordComponent;
  let fixture: ComponentFixture<VerifyPasswordComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VerifyPasswordComponent]
    });
    fixture = TestBed.createComponent(VerifyPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
