import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryLocationComponent } from './inventory-location.component';

describe('InventoryLocationComponent', () => {
  let component: InventoryLocationComponent;
  let fixture: ComponentFixture<InventoryLocationComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InventoryLocationComponent]
    });
    fixture = TestBed.createComponent(InventoryLocationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
