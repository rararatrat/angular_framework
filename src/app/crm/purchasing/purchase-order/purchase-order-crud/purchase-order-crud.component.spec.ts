import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseOrderCrudComponent } from './purchase-order-crud.component';

describe('QuotesCrudComponent', () => {
  let component: PurchaseOrderCrudComponent;
  let fixture: ComponentFixture<PurchaseOrderCrudComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [PurchaseOrderCrudComponent]
    });
    fixture = TestBed.createComponent(PurchaseOrderCrudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
