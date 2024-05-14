import { ComponentFixture, TestBed } from '@angular/core/testing';

import { VatTaxformComponent } from './vat-taxform.component';

describe('VatTaxformComponent', () => {
  let component: VatTaxformComponent;
  let fixture: ComponentFixture<VatTaxformComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [VatTaxformComponent]
    });
    fixture = TestBed.createComponent(VatTaxformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
