import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserbarComponent } from './userbar.component';

describe('UserbarComponent', () => {
  let component: UserbarComponent;
  let fixture: ComponentFixture<UserbarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UserbarComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
