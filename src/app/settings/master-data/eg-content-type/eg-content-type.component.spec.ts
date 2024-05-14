import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EgContentTypeComponent } from './eg-content-type.component';

describe('EgContentTypeComponent', () => {
  let component: EgContentTypeComponent;
  let fixture: ComponentFixture<EgContentTypeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [EgContentTypeComponent]
    });
    fixture = TestBed.createComponent(EgContentTypeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
