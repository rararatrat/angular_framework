import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuotesCrudComponent } from './quotes-crud.component';

describe('QuotesCrudComponent', () => {
  let component: QuotesCrudComponent;
  let fixture: ComponentFixture<QuotesCrudComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [QuotesCrudComponent]
    });
    fixture = TestBed.createComponent(QuotesCrudComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
