import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PosPreviewComponent } from './pos-preview.component';

describe('PosPreviewComponent', () => {
  let component: PosPreviewComponent;
  let fixture: ComponentFixture<PosPreviewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PosPreviewComponent]
    });
    fixture = TestBed.createComponent(PosPreviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
