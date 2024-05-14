import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaxRatesGlobalComponent } from './tax-rates-global.component';

describe('TaxRatesGlobalComponent', () => {
  let component: TaxRatesGlobalComponent;
  let fixture: ComponentFixture<TaxRatesGlobalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TaxRatesGlobalComponent]
    });
    fixture = TestBed.createComponent(TaxRatesGlobalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
