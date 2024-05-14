import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailRendererComponent } from './email-renderer.component';

describe('EmailRendererComponent', () => {
  let component: EmailRendererComponent;
  let fixture: ComponentFixture<EmailRendererComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EmailRendererComponent]
    });
    fixture = TestBed.createComponent(EmailRendererComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
