import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EgAutocompleteComponent } from './eg-autocomplete.component';

describe('EgAutocompleteComponent', () => {
  let component: EgAutocompleteComponent;
  let fixture: ComponentFixture<EgAutocompleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EgAutocompleteComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EgAutocompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
