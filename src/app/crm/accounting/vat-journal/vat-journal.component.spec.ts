import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VatJournalComponent } from './vat-journal.component';

describe('VatJournalComponent', () => {
  let component: VatJournalComponent;
  let fixture: ComponentFixture<VatJournalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VatJournalComponent]
    });
    fixture = TestBed.createComponent(VatJournalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
