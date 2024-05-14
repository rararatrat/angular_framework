import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VatTaxformDetailComponent } from './vat-taxform-detail.component';

describe('VatTaxformDetailComponent', () => {
  let component: VatTaxformDetailComponent;
  let fixture: ComponentFixture<VatTaxformDetailComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VatTaxformDetailComponent]
    });
    fixture = TestBed.createComponent(VatTaxformDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
