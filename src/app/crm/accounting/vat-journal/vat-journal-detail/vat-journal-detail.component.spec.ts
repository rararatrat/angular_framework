import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VatJournalDetailComponent } from './vat-journal-detail.component';

describe('VatJournalDetailComponent', () => {
  let component: VatJournalDetailComponent;
  let fixture: ComponentFixture<VatJournalDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VatJournalDetailComponent]
    });
    fixture = TestBed.createComponent(VatJournalDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
