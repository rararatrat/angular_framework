import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManualEntryDetailComponent } from './manual-entry-detail.component';

describe('ManualEntryDetailComponent', () => {
  let component: ManualEntryDetailComponent;
  let fixture: ComponentFixture<ManualEntryDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ManualEntryDetailComponent]
    });
    fixture = TestBed.createComponent(ManualEntryDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
