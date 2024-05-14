import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvoicesCrudComponent } from './invoices-crud.component';

describe('InvoicesCrudComponent', () => {
  let component: InvoicesCrudComponent;
  let fixture: ComponentFixture<InvoicesCrudComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InvoicesCrudComponent]
    });
    fixture = TestBed.createComponent(InvoicesCrudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
