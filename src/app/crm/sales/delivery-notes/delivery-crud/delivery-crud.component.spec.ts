import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeliveryCrudComponent } from './delivery-crud.component';

describe('DeliveryCrudComponent', () => {
  let component: DeliveryCrudComponent;
  let fixture: ComponentFixture<DeliveryCrudComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DeliveryCrudComponent]
    });
    fixture = TestBed.createComponent(DeliveryCrudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
