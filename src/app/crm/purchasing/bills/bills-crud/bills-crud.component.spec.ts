import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillsCrudComponent } from './bills-crud.component';

describe('BillsCrudComponent', () => {
  let component: BillsCrudComponent;
  let fixture: ComponentFixture<BillsCrudComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BillsCrudComponent]
    });
    fixture = TestBed.createComponent(BillsCrudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
