import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InventoryAreaComponent } from './inventory-area.component';

describe('InventoryAreaComponent', () => {
  let component: InventoryAreaComponent;
  let fixture: ComponentFixture<InventoryAreaComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [InventoryAreaComponent]
    });
    fixture = TestBed.createComponent(InventoryAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
