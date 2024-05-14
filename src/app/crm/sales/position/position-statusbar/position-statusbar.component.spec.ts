import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PositionStatusbarComponent } from './position-statusbar.component';

describe('PositionStatusbarComponent', () => {
  let component: PositionStatusbarComponent;
  let fixture: ComponentFixture<PositionStatusbarComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PositionStatusbarComponent]
    });
    fixture = TestBed.createComponent(PositionStatusbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
