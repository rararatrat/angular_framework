import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProductTypeComponent } from './product-type.component';

describe('ProductTypeComponent', () => {
  let component: ProductTypeComponent;
  let fixture: ComponentFixture<ProductTypeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ProductTypeComponent]
    });
    fixture = TestBed.createComponent(ProductTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
