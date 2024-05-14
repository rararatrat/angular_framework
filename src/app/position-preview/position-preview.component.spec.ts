import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PositionPreviewComponent } from './position-preview.component';

describe('PositionPreviewComponent', () => {
  let component: PositionPreviewComponent;
  let fixture: ComponentFixture<PositionPreviewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PositionPreviewComponent]
    });
    fixture = TestBed.createComponent(PositionPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
