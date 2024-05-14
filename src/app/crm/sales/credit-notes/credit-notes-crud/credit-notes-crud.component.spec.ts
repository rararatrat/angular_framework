import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreditNotesCrudComponent } from './credit-notes-crud.component';

describe('CreditNotesCrudComponent', () => {
  let component: CreditNotesCrudComponent;
  let fixture: ComponentFixture<CreditNotesCrudComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CreditNotesCrudComponent]
    });
    fixture = TestBed.createComponent(CreditNotesCrudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
